import { AccessOptions } from '~/common';
import { permissions } from '~/configs';

export const ACL = {
    superAdminOnly: {
        permissions: [
            permissions.SWITCH_ORGANIZATIONS.name,
            permissions.MANAGE_USERS.name,
            permissions.LEAVE_REQUEST.name,
            permissions.LEAVE_APPROVAL.name,
            permissions.LEAVE_CONFIGS.name
        ],
        matchAllPermissions: true
    },

    switchOrganizations: {
        permissions: [permissions.SWITCH_ORGANIZATIONS.name],
        matchAllPermissions: true
    },

    manageUsers: {
        permissions: [permissions.MANAGE_USERS.name],
        matchAllPermissions: true
    },

    leaveRequestAccess: {
        permissions: [permissions.LEAVE_REQUEST.name],
        matchAllPermissions: true
    },

    leaveApprovalAccess: {
        permissions: [permissions.LEAVE_APPROVAL.name],
        matchAllPermissions: true
    },

    leaveConfigManagement: {
        permissions: [permissions.LEAVE_CONFIGS.name],
        matchAllPermissions: true
    }
} as const satisfies Record<string, AccessOptions>;
