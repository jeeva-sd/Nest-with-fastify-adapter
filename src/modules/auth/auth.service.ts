import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Helper, Store } from '~/common';
import { appConfig } from '~/configs';
import { prisma } from '~/services/database/prisma.service';
import { PortalRoleType } from '../eco-apps/types/portal-roles';
import { PermissionCacheService } from '../roles';
import { RoleService } from '../roles/role.service';
import { PortalCookieDto } from './schemas/portal-cookie-values';

// Define the type for users with roles and permissions
export type UserWithRolePermissions = Prisma.UserGetPayload<{
    select: {
        id: true;
        fname: true;
        lname: true;
        email: true;
        organizationId: true;
        roleId: true;
        bio: true;
        country: true;
        phone: true;
        profileImage: true;
        timezone: true;
        role: {
            select: {
                id: true;
                name: true;
                rolePermissions: {
                    select: {
                        permission: {
                            select: {
                                id: true;
                                name: true;
                            };
                        };
                    };
                };
            };
        };
    };
}>;

@Injectable()
export class AuthService {
    constructor(
        @Inject(appConfig.auth.basicJWT.name) private readonly jwtService: JwtService,
        private readonly cls: ClsService<Store>,
        private readonly roleService: RoleService,
        private readonly permissionCacheService: PermissionCacheService
    ) {}

    private basicUserSelect(): Prisma.UserSelect {
        return {
            id: true,
            fname: true,
            lname: true,
            email: true,
            organizationId: true,
            roleId: true,
            bio: true,
            country: true,
            phone: true,
            profileImage: true,
            timezone: true
        };
    }

    private prepareUserData(portalResponse: PortalCookieDto) {
        return {
            fname: portalResponse.fname,
            lname: portalResponse.lname,
            bio: portalResponse.bio,
            country: portalResponse.country,
            organizationId: portalResponse.oid,
            phone: portalResponse.phone,
            profileImage: portalResponse.profileImage,
            roleId: portalResponse?.roleId,
            status: portalResponse.status,
            timezone: portalResponse.timezone,
            email: portalResponse.sub
        };
    }

    private async mapLoginData(user: UserWithRolePermissions) {
        const roleId = user.roleId;
        const permissionRevision = await this.roleService.getPermissionRevision(roleId);
        const accessId = this.permissionCacheService.generateAccessId(user.organizationId, roleId, permissionRevision);

        return {
            userData: {
                userId: user.id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                roleId: roleId,
                roleName: user.role?.name,
                phone: user.phone,
                bio: user.bio,
                country: user.country,
                profileImage: user.profileImage,
                timezone: user.timezone,
                organizationId: user.organizationId
            },
            tokenData: {
                sub: user.id,
                orgId: user.organizationId,
                roleId: roleId,
                accessId
            }
        };
    }

    private calculateExpiration(exp: number): { expirationDate: Date; expiresIn: number } {
        const expirationDate = new Date(exp * 1000);
        const expiresIn = Math.max(0, Math.floor((expirationDate.getTime() - Date.now()) / 1000));
        return { expirationDate, expiresIn };
    }

    // -------------------------------------------- ✨ Public Methods ✨ --------------------------------------------

    async checkLogin(portalResponse: PortalCookieDto) {
        const portalUserData = this.prepareUserData(portalResponse);

        const userDataToUpdate = { ...Helper.Object.omit(portalUserData, ['roleId']) } as Partial<
            typeof portalUserData
        >;
        if ([PortalRoleType.ORG_ADMIN, PortalRoleType.SUPER_ADMIN].includes(portalResponse.roleType)) {
            userDataToUpdate.roleId = portalResponse.roleId;
        }

        const user = await prisma.$transaction(async prisma => {
            // Upsert user
            const userRes = await prisma.user.upsert({
                where: { id: portalResponse.userId },
                create: {
                    id: portalResponse.userId,
                    ...portalUserData
                },
                update: userDataToUpdate,
                select: {
                    ...this.basicUserSelect(),
                    role: {
                        select: {
                            id: true,
                            name: true,
                            rolePermissions: {
                                select: {
                                    permission: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // Emit department sync event if departments exist
            if (portalResponse?.departments) {
                const departmentInfo = portalResponse.departments.map(dep => ({
                    departmentId: dep.id,
                    title: dep.title ?? null,
                    supervisorIds: (dep.supervisors || []).map(s => s.id)
                }));

                console.log(departmentInfo, 'departmentInfo');
            }

            return userRes;
        });

        const { userData, tokenData } = await this.mapLoginData(user); // Prepare login data
        const { expiresIn } = this.calculateExpiration(portalResponse.exp); // Calculate token expiration
        const accessToken = this.jwtService.sign(tokenData, { expiresIn }); // Generate JWT token

        return { ...userData, accessToken };
    }

    async impersonate() {
        const reqUser = this.cls.get('userToImpersonate'); // 👮🏻 Data from impersonation guard
        const { userData, tokenData } = await this.mapLoginData(reqUser);

        const expiresIn = 60 * 60 * 1; // 1 hours
        const accessToken = this.jwtService.sign(tokenData, { expiresIn });
        return { ...userData, accessToken };
    }
}
