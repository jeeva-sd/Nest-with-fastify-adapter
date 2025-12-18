import { FastifyRequest } from 'fastify';
import { FileDetail } from '../guards/req-payload.guard';

export type TokenData = {
    sub: string; // userId
    orgId: string;
    roleId: string;
    accessId: string;
};

export interface RequestX extends FastifyRequest {
    uploadedFiles?: FileDetail[];
    user: TokenData;
    payload?: unknown;
    startTime?: number;
    skipFileCleanup?: boolean; // Flag to skip file cleanup entirely
    skipFileCleanupFields?: string[]; // Field names whose files should not be deleted
}
