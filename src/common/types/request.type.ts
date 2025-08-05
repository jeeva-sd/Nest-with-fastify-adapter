import { FastifyRequest } from 'fastify';
import { FileDetail } from '../guards';

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
    uploadedFiles?: FileDetail[];
    user: TokenData;
    payload?: any;
    startTime?: number;
    skipFileCleanup?: boolean; // Flag to skip file cleanup entirely
    skipFileCleanupFields?: string[]; // Field names whose files should not be deleted
}
