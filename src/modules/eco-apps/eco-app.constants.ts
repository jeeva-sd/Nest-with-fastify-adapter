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
            listOnIds: 'user/list-on-ids-v2',
            findByEmail: 'user/user-by-email'
        }
    }
} as const;
