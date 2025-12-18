export interface PortalLoginResponse {
    sub: string;
    userId: string;
    oid: string;
    oname: string;
    roleId: number;
    name: string;
    profileImage: boolean;
    timezone: string;
    fname: string;
    lname: string;
    title: string;
    phone: string;
    country: string;
    roleName: string;
    iat: number;
    exp: number;
    organizationId: string;
    departmentId: number | null;
    bio: string;
    status: number;
    departments: {
        id: number;
        name: string;
        title: string;
        supervisors: unknown[];
    }[];
    roleType: string;
    globalJwtToken: {
        expires: string;
        access_token: string;
        profile: {
            roleId: number;
            name: string;
            profileImage: boolean;
            timezone: string;
            fname: string;
            lname: string;
            title: string;
            phone: string;
            country: string;
            roleName: string;
        };
    };
}
