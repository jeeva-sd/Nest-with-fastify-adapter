import { FastifyReply } from 'fastify';

export interface ResponseX extends FastifyReply {
    statusCode: number;
    message: string | null;
    data: unknown;
    traceId?: string;
}

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
        supervisors: any[];
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
