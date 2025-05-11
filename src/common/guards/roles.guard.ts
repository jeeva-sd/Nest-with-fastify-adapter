import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from '~/configs';
import { RequestX } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const handler = context.getHandler();
        const controller = context.getClass();
        const request: RequestX = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Roles
        const roleMeta = this.reflector.getAllAndOverride<{ roles: string[]; matchAll: boolean; }>(
            appConfig.auth.roleKey,
            [handler, controller]
        );

        if (roleMeta?.roles?.length) {
            const hasRoles = this.match(user.roles || [], roleMeta.roles, roleMeta.matchAll);
            if (!hasRoles) throw new ForbiddenException(`Insufficient role permissions`);
        }

        // Permissions
        const permissionMeta = this.reflector.getAllAndOverride<{ permissions: string[]; matchAll: boolean; }>(
            appConfig.auth.permissionKey,
            [handler, controller]
        );

        if (permissionMeta?.permissions?.length) {
            const hasPerms = this.match(user.permissions || [], permissionMeta.permissions, permissionMeta.matchAll);
            if (!hasPerms) throw new ForbiddenException(`Insufficient permissions`);
        }

        return true;
    }

    private match(userValues: string[], required: string[], matchAll: boolean): boolean {
        if (matchAll) return required.every((val) => userValues.includes(val));
        return required.some((val) => userValues.includes(val));
    }
}
