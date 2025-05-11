import { AccessOptions } from '~/common';

export const ACL: Record<string, AccessOptions> = {
    AdminOnly: {
        roles: ['admin'],
        matchAllRoles: true
    },
    ManagerOrAdmin: {
        roles: ['admin', 'manager'],
        matchAllRoles: false
    },
    UserWithPermissionToEdit: {
        permissions: ['edit:profile'],
        matchAllPermissions: true
    },
    FullAccess: {
        roles: ['admin'],
        permissions: ['*'],
        matchAllRoles: true,
        matchAllPermissions: false
    }
};
