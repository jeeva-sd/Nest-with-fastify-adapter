import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RequestX, Store } from '~/common';
import { PrismaService } from '~/services';
import { ImpersonateUserDto } from '../schemas/user-impersonation';

@Injectable()
export class ImpersonationGuard implements CanActivate {
    constructor(private readonly cls: ClsService<Store>, private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestX = context.switchToHttp().getRequest();
        const _requestedUser = request.user;
        const payload = request.payload as ImpersonateUserDto;

        // Fetch the user to impersonate
        const existingUser = await this.prisma.user.findFirst({
            where: { id: payload.userId },
            select: {
                id: true,
                fname: true,
                lname: true,
                email: true,
                organizationId: true,
                roleId: true,
                bio: true,
                phone: true,
                country: true,
                timezone: true,
                profileImage: true,
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

        // Check if the user to impersonate is valid
        if (!existingUser) throw new NotFoundException('User not found');
        if (request.user.sub === existingUser.id) throw new BadRequestException('Cannot impersonate yourself');
        // Check if the user is allowed to update users from different organizations
        if (request.user.orgId !== existingUser.organizationId) {
            throw new ForbiddenException('You are not allowed to impersonate users from different organizations');
        }

        this.cls.set('userToImpersonate', existingUser); // Store the user to impersonate in the CLS store

        return true; // Allow the request to proceed
    }
}
