import { FastifyRequest } from 'fastify';

export type TokenData = {
    id: string;
    fname: string;
    lname: string;
    email: string;
    roleId: string | null;
    organizationId: string;
    timezone: string;
    permissions: string[]; // Assigned permission names
};

export interface RequestX extends FastifyRequest {
    uploadedFiles?: string[];
    user: TokenData;
    payload?: any;
}
