export const permissions = {
    SWITCH_ORGANIZATIONS: {
        id: 'cmboy34mj000007k09o5hau8p',
        name: 'SWITCH_ORGANIZATIONS',
        description: 'Allows switching between organizations'
    },
    MANAGE_USERS: {
        id: 'cmboy3ecn000107k0cbql2uzw',
        name: 'MANAGE_USERS',
        description: 'Allows managing user accounts'
    }
} as const;

// Roles with Permissions
export const standardRoles = {
    SUPER_ADMIN: {
        id: 'cmboy3wbr000507k0griygdsa',
        name: 'SUPER_ADMIN',
        description: 'System-wide administrator with full access',
        permissions: [permissions.SWITCH_ORGANIZATIONS, permissions.MANAGE_USERS]
    },
    ORG_ADMIN: {
        id: 'cmboy4f39000707k045ithbpo',
        name: 'ORG_ADMIN',
        description: 'Organization-level admin with full leave access',
        permissions: [permissions.MANAGE_USERS]
    },
    USER: {
        id: 'cmboy4tkd000907k00jes1bye',
        name: 'USER',
        description: 'Basic app access',
        permissions: []
    }
};

// Flat permission names
export const standardPermissions = Object.values(permissions).map(p => p.name);
export type PermissionName = (typeof standardPermissions)[number];
