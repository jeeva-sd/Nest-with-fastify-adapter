import { ResponseX } from '../types';
import { ReplayCodes, replayMessages } from '../../constants';

// Common function to build a ResponseX
const buildResponseX = (statusCode: number, data: any = null, message?: string): ResponseX => {
    const replayMessage = message ?? replayMessages[statusCode]?.message ?? null;

    return {
        statusCode,
        message: replayMessage,
        data
    };
};

// Specific functions
export const take = (code: ReplayCodes = 200, data?: unknown, message?: string): ResponseX => {
    return buildResponseX(code, data, message);
};

const dataFound = (data: any): ResponseX => {
    return buildResponseX(1000, data);
};

const dataNotFound = (data: any = []): ResponseX => {
    return buildResponseX(1001, data);
};

export const dataList = (data: any): ResponseX => {
    if (!data) return dataNotFound();
    if (data?.hasOwnProperty('total') && data.total === 0) return dataNotFound(data);
    if (Array.isArray(data) && data.length > 0) return dataFound(data);
    if (typeof data === 'object' && Object.keys(data).length > 0) return dataFound(data);
    return dataNotFound();
};
