import { AccessOptions } from '~/common';
import { permissions } from '~/configs';

export const ACL = {
    superAdminOnly: {
        permissions: [permissions.SWITCH_ORGS.name, permissions.MANAGE_USERS.name],
        matchAllPermissions: true
    },
    switchOrgs: {
        permissions: [permissions.SWITCH_ORGS.name],
        matchAllPermissions: true
    },
    manageUsers: {
        permissions: [permissions.MANAGE_USERS.name],
        matchAllPermissions: true
    }
} as const satisfies Record<string, AccessOptions>;
