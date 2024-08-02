import { actionMessages, MessageStatus } from 'src/constants';
import { readError } from './error.handler';

// Common function to build an ResponseX
const buildResponseX = (code: number, data?: any, options?: any) => {
    const message = options?.message ? readError(options?.message) : (actionMessages[code]?.message ?? null);
    const status = actionMessages[code]?.status ?? MessageStatus.success;
    const error = options?.error ? readError(options?.error) : null;

    return {
        code,
        status,
        message,
        data: data || null,
        error,
    };
};

// specific code
export const take = (code = 200, res?: any, options?: any) => {
    const data = res?.data ?? res;
    return buildResponseX(code, data, options);
};

// client error
export const clientError = (error?: any) => {
    return buildResponseX(400, null, {
        message: error,
        error: 'Validation error',
    });
};

export const customResponse = (code = 200, message?: string, data = null, error = null) => {
    return buildResponseX(code, data, { error, message });
};

export const dataFound = (res: any) => {
    const data = res.data ?? res;
    return buildResponseX(1000, data);
};

export const dataNotFound = (res: any = []) => {
    const data = res.data ?? res;
    return buildResponseX(1001, data);
};

export const dataList = (data: any) => {
    if (!data) return dataNotFound();
    else if (Array.isArray(data) && data.length > 0) return dataFound(data);
    else if (typeof data === 'object' && Object.keys(data).length > 0) return dataFound(data);
    else return dataNotFound();
};
