import { permissions } from '../role.constants';
import { AccessOptions } from '../role.decorators';

export const ACL = {
    superAdminOnly: {
        permissions: [permissions.SWITCH_ORGANIZATIONS.name, permissions.MANAGE_USERS.name],
        matchAllPermissions: true
    },
    superAdminOr: {
        permissions: [permissions.SWITCH_ORGANIZATIONS.name, permissions.MANAGE_USERS.name],
        matchAllPermissions: false
    },
    switchOrganizations: {
        permissions: [permissions.SWITCH_ORGANIZATIONS.name],
        matchAllPermissions: true
    },
    manageUsers: {
        permissions: [permissions.MANAGE_USERS.name],
        matchAllPermissions: true
    }
} as const satisfies Record<string, AccessOptions>;
