import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from './role.service';
import { Exception, RequestX, UserPermissions } from 'src/utils';

export enum User {
    All = 'all',
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin'
}

const initialUserPermission: UserPermissions = {
    isSuperAdmin: false,
    isAdmin: false
};

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private roleService: RoleService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<User[]>('roles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request: RequestX = context.switchToHttp().getRequest();
        const userRoleId = ''; //  request.user.roleId;
        if (!userRoleId) return false;

        const superAdminIds = await this.roleService.getSuperAdminIds();
        const adminIds = await this.roleService.getAdminIds();

        const allowedRoles = Array.from(
            new Set([
                ...(requiredRoles.includes(User.SuperAdmin) ? superAdminIds : []),
                ...(requiredRoles.includes(User.Admin) ? adminIds : [])
            ])
        );

        if (!requiredRoles.includes(User.All) && !allowedRoles.includes(userRoleId)) throw new Exception(403);
        request.userRole = { ...initialUserPermission };

        if (superAdminIds.includes(userRoleId)) request.userRole.isSuperAdmin = true;
        if (adminIds.includes(userRoleId)) request.userRole.isAdmin = true;
        return true;
    }
}

export const Allow = (...roles: User[]) => SetMetadata('roles', roles);
