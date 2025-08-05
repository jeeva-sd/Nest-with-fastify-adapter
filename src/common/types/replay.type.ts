import { FastifyReply } from 'fastify';

export interface ResponseX extends FastifyReply {
    statusCode: number;
    message: string | null;
    data: unknown;
    traceId?: string;
}
