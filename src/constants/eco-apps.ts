export const ecoAppEndpoints = {
    portal: {
        validateCookie: 'auth/check-login',
        updateUserDetails: 'user/update',
        createUser: 'admin/user/create',
        getTimezones: 'utility/timezone-list',
        getCountries: 'utility/country-list',
        findOrganization: 'organizations/get',
        role: {
            findRole: 'roles/info'
        },
        admin: {
            organizationList: 'admin/organizations/list'
        },
        user: {
            listOnIds: 'user/list-on-ids-v2'
        }
    }
} as const;

export enum PortalRoleType {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ORG_ADMIN = 'ORG_ADMIN',
    STANDARD_USER = 'STANDARD_USER'
}
