// Define permission keys as constants
export enum PermissionKeys {
    SWITCH_ORGS = 'switch_orgs',
    MANAGE_USERS = 'manage_users'
}

// Define role keys as constants
export enum RoleKeys {
    SUPER_ADMIN = 'Super Admin',
    ADMIN = 'Admin',
    STANDARD_USER = 'Standard User'
}

// Define permissions as an object with IDs and names
export const permissions = {
    SWITCH_ORGS: { id: 'cmb0t05y100010dlch3cug34v', name: PermissionKeys.SWITCH_ORGS },
    MANAGE_USERS: { id: 'cmb0t0bus00020dlc4alf2qxt', name: PermissionKeys.MANAGE_USERS }
} as const;

// Define roles as an object with IDs, names, and descriptions
export const standardRoles = {
    SUPER_ADMIN: {
        id: 'cmb0t1rvc00050dlceis912v8',
        name: RoleKeys.SUPER_ADMIN,
        description: 'Administrator with full access',
        isCustom: false,
        permissions: [permissions.SWITCH_ORGS, permissions.MANAGE_USERS]
    },
    ORG_ADMIN: {
        id: 'cmb0t2fvh000a0dlc0y3zbiho',
        name: RoleKeys.ADMIN,
        description: 'Administrator with full access limited to their organization',
        isCustom: false,
        permissions: [permissions.MANAGE_USERS]
    },
    STANDARD_USER: {
        id: 'cmb0t3ojr000s0dlce0jrehwe',
        name: RoleKeys.STANDARD_USER,
        description: 'STANDARD_USER with basic access',
        isCustom: false,
        permissions: []
    }
} as const;

// Extract available permissions as a flat array
export const standardPermissions = Object.values(permissions).map(p => p.name);
