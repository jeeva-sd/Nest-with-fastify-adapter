import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestX } from '~/common';
import { appConfig } from '~/configs';
import { PermissionName } from '~/modules/roles/role.constants';
import { PermissionCacheService } from '../permission-cache.service';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionCache: PermissionCacheService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const handler = context.getHandler();
        const controller = context.getClass();
        const request: RequestX = context.switchToHttp().getRequest();
        const jwtUser = request.user;

        if (!jwtUser?.accessId) {
            throw new ForbiddenException('User not authenticated');
        }

        const permissionMeta = this.reflector.getAllAndOverride<{ permissions: PermissionName[]; matchAll: boolean }>(
            appConfig.auth.permissionKey,
            [handler, controller]
        );

        if (!permissionMeta?.permissions?.length) {
            return true; // No permissions required
        }

        const { permissions: requiredPermissions, matchAll } = permissionMeta;
        const userPermissions = await this.permissionCache.getPermissions(jwtUser.accessId, jwtUser.roleId);

        const hasPermissions = matchAll
            ? requiredPermissions.every(perm => userPermissions.includes(perm))
            : requiredPermissions.some(perm => userPermissions.includes(perm));

        if (!hasPermissions) {
            throw new ForbiddenException('Insufficient permissions to access this resource');
        }

        return true;
    }
}
