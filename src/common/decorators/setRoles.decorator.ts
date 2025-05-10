import { applyDecorators, SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';

export interface AccessOptions {
    roles?: string[];
    permissions?: string[];
    matchAllRoles?: boolean;
    matchAllPermissions?: boolean;
}

export const Roles = (roles: string[], matchAll = false) =>
    SetMetadata(appConfig.auth.roleKey, { roles, matchAll });

export const Permissions = (permissions: string[], matchAll = false) =>
    SetMetadata(appConfig.auth.permissionKey, { permissions, matchAll });

export const Access = ({
    roles = [],
    permissions = [],
    matchAllRoles = false,
    matchAllPermissions = false,
}: AccessOptions) =>
    applyDecorators(
        Roles(roles, matchAllRoles),
        Permissions(permissions, matchAllPermissions)
    );
