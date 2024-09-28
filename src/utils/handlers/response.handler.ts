import { FastifyReply } from 'fastify';
import { ActionMessageCodes, actionMessages, MessageStatus } from 'src/constants';
import { readError } from './error.handler';

export interface ReplayX extends FastifyReply {}
export interface ResponseX {
    code: number;
    status: MessageStatus;
    message: string | null;
    data: any;
    error: string | null;
}

// Common function to build a ResponseX
const buildResponseX = (
    code: number,
    data: any = null,
    options: { message?: string; error?: string } = {}
): ResponseX => {
    const message = options.message ? readError(options.message) : (actionMessages[code]?.message ?? null);
    const status = (actionMessages[code]?.status ?? MessageStatus.success) as MessageStatus;
    const error = options.error
        ? readError(options.error)
        : actionMessages[code]?.error
          ? readError(actionMessages[code].error)
          : null;

    return {
        code,
        status,
        message,
        data,
        error
    };
};

// Specific functions
export const take = (
    code: ActionMessageCodes = 200,
    res?: any,
    options?: { message?: string; error?: string }
): ResponseX => {
    return buildResponseX(code, res, options);
};

export const takeException = (code = 200, message: string | null = null, error: string | null = null): ResponseX => {
    return buildResponseX(code, null, { message, error });
};

const dataFound = (res: any): ResponseX => {
    return buildResponseX(1000, res);
};

const dataNotFound = (res: any = []): ResponseX => {
    return buildResponseX(1001, res);
};

export const dataList = (data: any): ResponseX => {
    if (!data) return dataNotFound();
    if (data?.hasOwnProperty('total') && data.total === 0) return dataNotFound(data);
    if (Array.isArray(data) && data.length > 0) return dataFound(data);
    if (typeof data === 'object' && Object.keys(data).length > 0) return dataFound(data);
    return dataNotFound();
};
