import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Helper, readError } from '~/common';
import { appConfig } from '~/configs';
import { PrismaService } from '~/services';
import { AppEvents } from '../events/event.emitter';
import { RoleService } from '../roles/role.service';
import { portalServer } from './eco-app.config';
import { ecoAppEndpoints } from './eco-app.constants';
import { CountryListDto, CreateUserHookDto, OrganizationListDto, TimezoneDto, UserUpdateHookDto } from './schemas';
import { PortalRoleType } from './types/portal-roles';

export interface PortalUserBasic {
    id: string;
    fname: string;
    lname: string;
    email: string;
    organizationId: string;
    phone: string;
    roleId: number | string;
    country: string;
    bio: string;
    timezone: string;
    profileImage: boolean;
}

@Injectable()
export class EcoAppsService {
    constructor(
        private readonly roleService: RoleService,
        private readonly prismaService: PrismaService,
        private readonly event: AppEvents
    ) {}

    async validatePortalCookie(cookieName: string, token: string) {
        try {
            const headers = { Cookie: `${cookieName}=${token}` };
            return await portalServer.post(
                ecoAppEndpoints.portal.validateCookie,
                { appId: appConfig.server.appId },
                headers
            );
        } catch (error) {
            if (error?.response?.status === 403) {
                throw new ForbiddenException('Insufficient permissions to access this resource');
            }
            throw new UnauthorizedException('Invalid or expired session token');
        }
    }

    async createUser({ fname, lname, email, bio, country, phone, roleType, organizationId }: CreateUserHookDto) {
        try {
            const bodyForm = new FormData();

            if (email) bodyForm.append('email', email);
            if (fname) bodyForm.append('fname', fname);
            if (lname) bodyForm.append('lname', lname);
            if (organizationId) bodyForm.append('organizationId', organizationId);
            if (phone) bodyForm.append('phone', phone);
            if (country) bodyForm.append('country', country);
            if (bio) bodyForm.append('bio', bio);
            if (roleType) bodyForm.append('roleType', roleType);

            return await portalServer.post(ecoAppEndpoints.portal.createUser, bodyForm);
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async updateUser({
        fname,
        lname,
        bio,
        country,
        userId,
        phone,
        timezone,
        roleType,
        profileImageBuffer
    }: UserUpdateHookDto) {
        try {
            const bodyForm = new FormData();

            if (userId) bodyForm.append('userId', userId);
            if (fname) bodyForm.append('fname', fname);
            if (lname) bodyForm.append('lname', lname);
            if (phone) bodyForm.append('phone', phone);
            if (country) bodyForm.append('country', country);
            if (bio) bodyForm.append('bio', bio);
            if (timezone) bodyForm.append('timezone', timezone);
            if (roleType && [PortalRoleType.SUPER_ADMIN, PortalRoleType.ORG_ADMIN].includes(roleType)) {
                bodyForm.append('roleType', roleType);
            }
            if (profileImageBuffer) {
                const imageFile = await Helper.File.readFile(profileImageBuffer[0].filePath);
                const blob = new Blob([new Uint8Array(imageFile)], { type: profileImageBuffer[0].mimetype });
                bodyForm.append('profileImage', blob, profileImageBuffer[0].fileName);
            }

            return await portalServer.post(ecoAppEndpoints.portal.updateUserDetails, bodyForm);
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async syncLocalUser({ roleType, userId, departmentInfo, ...dto }: UserUpdateHookDto) {
        const userExists = await this.prismaService.user.findUnique({ where: { id: userId } });
        if (!userExists) return true;

        if (roleType) {
            const roleId = this.roleService.getRoleIdFromPortalRoleType(roleType);
            dto.roleId = roleId;
        }

        if (departmentInfo && Array.isArray(departmentInfo)) {
            await this.event.syncDepartment({ userId, departmentInfo });
        }

        // Step 7: Prepare user update operation
        const updateUserOp = this.prismaService.user.update({
            where: { id: userId.toString() },
            data: dto
        });

        return await updateUserOp;
    }

    async findAllTimezones(dto: TimezoneDto) {
        try {
            const portalResponse = await portalServer.post(ecoAppEndpoints.portal.getTimezones, {
                page: dto.page - 1, // Transform page number from 1-based to 0-based for query
                size: dto.limit
            });

            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async findAllCountries(dto: CountryListDto) {
        try {
            const portalResponse = await portalServer.post(ecoAppEndpoints.portal.getCountries, {
                page: dto.page - 1, // Transform page number from 1-based to 0-based for query
                size: dto.limit
            });

            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async findOrganization(orgId: string) {
        try {
            const portalResponse = await portalServer.post(ecoAppEndpoints.portal.findOrganization, {
                id: orgId
            });

            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async findUserById(userIds: string[]) {
        try {
            const portalResponse = await portalServer.post(ecoAppEndpoints.portal.user.listOnIds, {
                userIds
            });

            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async findUserByEmail(userEmail: string) {
        try {
            const portalResponse = await portalServer.post(ecoAppEndpoints.portal.user.findByEmail, {
                email: userEmail
            });

            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    getBasicUserDetailsFormPortalObj(user): PortalUserBasic {
        return {
            id: user?.id,
            fname: user?.fname,
            lname: user?.lname,
            email: user?.email,
            organizationId: user?.organizationId,
            phone: user?.phone,
            roleId: this.roleService.getRoleIdFromPortalRoleType(user?.roleType),
            country: user?.country,
            timezone: user?.timezone,
            bio: user?.bio,
            profileImage: user?.profileImage
        };
    }

    async findRoleInfo(roleId: number) {
        try {
            const portalResponse = await portalServer.post(`${ecoAppEndpoints.portal.role.findRole}?id=${roleId}`);
            return portalResponse.data;
        } catch (error) {
            throw new BadRequestException(readError(error));
        }
    }

    async findAllOrganization(payload: OrganizationListDto) {
        const organizationList = await portalServer.post(ecoAppEndpoints.portal.admin.organizationList, {
            search: payload.searchTerm,
            page: payload.page - 1, // Transform page number from 1-based to 0-based for query
            size: payload.limit
        });

        return {
            total: organizationList?.data?.total || 0,
            organizations: organizationList?.data?.rows || []
        };
    }

    // async syncLocalUser({ roleType, userId, departmentInfo, ...dto }: UserUpdateHookDto) {
    //     const userExists = await prisma.user.findUnique({ where: { id: userId.toString() } });
    //     if (!userExists) return true;

    //     if (roleType) {
    //         const roleId = this.roleService.getRoleIdFromRoleType(roleType);
    //         dto['roleId'] = roleId;
    //     }

    //     if (departmentInfo && Array.isArray(departmentInfo)) {
    //         this.messagesClient.emit(generalEvents.ecoApps.departmentSync, departmentInfo);
    //     }

    //     // Step 7: Prepare user update operation
    //     const updateUserOp = prisma.user.update({
    //         where: { id: userId.toString() },
    //         data: dto
    //     });

    //     return await updateUserOp;
    // }
}
