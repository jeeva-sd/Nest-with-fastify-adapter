// Permission Keys
export enum LeavePermissionKeys {
    SWITCH_ORGANIZATIONS = 'switch_organizations',
    MANAGE_USERS = 'manage_users',

    LEAVE_REQUEST = 'leave_request',
    LEAVE_APPROVAL = 'leave_approval',
    LEAVE_CONFIGS = 'leave_configs'
}

// Role Keys
export enum LeaveRoleKeys {
    SUPER_ADMIN = 'Super Admin',
    ORG_ADMIN = 'Org Admin',
    MANAGER = 'Manager',
    EMPLOYEE = 'Employee'
}

// Permissions Object
export const permissions = {
    SWITCH_ORGANIZATIONS: {
        id: 'cmboy34mj000007k09o5hau8p',
        name: LeavePermissionKeys.SWITCH_ORGANIZATIONS,
        description: 'Allows switching between organizations'
    },
    MANAGE_USERS: {
        id: 'cmboy3ecn000107k0cbql2uzw',
        name: LeavePermissionKeys.MANAGE_USERS,
        description: 'Allows managing user accounts'
    },
    LEAVE_REQUEST: {
        id: 'cmboy3ho1000207k02x8827q7',
        name: LeavePermissionKeys.LEAVE_REQUEST,
        description: 'Allows submitting leave requests'
    },
    LEAVE_APPROVAL: {
        id: 'cmboy3leo000307k024sefb5t',
        name: LeavePermissionKeys.LEAVE_APPROVAL,
        description: 'Allows approving or rejecting leave requests'
    },
    LEAVE_CONFIGS: {
        id: 'cmboy3oxe000407k0a7wv6xo5',
        name: LeavePermissionKeys.LEAVE_CONFIGS,
        description: 'Allows configuring leave policies and settings'
    }
} as const;

// Roles with Permissions
export const standardRoles = {
    SUPER_ADMIN: {
        id: 'cmboy3wbr000507k0griygdsa',
        name: LeaveRoleKeys.SUPER_ADMIN,
        description: 'System-wide administrator with full access',
        permissions: [
            permissions.SWITCH_ORGANIZATIONS,
            permissions.MANAGE_USERS,
            permissions.LEAVE_REQUEST,
            permissions.LEAVE_APPROVAL,
            permissions.LEAVE_CONFIGS
        ]
    },
    ORG_ADMIN: {
        id: 'cmboy4f39000707k045ithbpo',
        name: LeaveRoleKeys.ORG_ADMIN,
        description: 'Organization-level admin with full leave access',
        permissions: [
            permissions.MANAGE_USERS,
            permissions.LEAVE_REQUEST,
            permissions.LEAVE_APPROVAL,
            permissions.LEAVE_CONFIGS
        ]
    },
    MANAGER: {
        id: 'cmboy4l0b000807k0cfbs7fbm',
        name: LeaveRoleKeys.MANAGER,
        description: 'Manager who approves leave requests',
        permissions: [permissions.LEAVE_REQUEST, permissions.LEAVE_APPROVAL]
    },
    EMPLOYEE: {
        id: 'cmboy4tkd000907k00jes1bye',
        name: LeaveRoleKeys.EMPLOYEE,
        description: 'Basic access for submitting and tracking leave',
        permissions: [permissions.LEAVE_REQUEST]
    }
};

// Flat permission names
export const availableLeavePermissions = Object.values(permissions).map(p => p.name);
