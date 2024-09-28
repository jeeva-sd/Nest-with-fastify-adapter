import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ActionMessageCodes } from 'src/constants';
import { ReplayX, takeException } from './response.handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ReplayX>();
        const exceptionResponse: any = exception.getResponse();
        let actualResponse = null;

        const errorCode =
            exceptionResponse.statusCode > 100 && exceptionResponse.statusCode < 1000
                ? exceptionResponse.statusCode
                : 400;

        if (exceptionResponse.prepared) {
            actualResponse = exceptionResponse.data;
        } else {
            actualResponse = takeException(
                exceptionResponse.statusCode,
                exceptionResponse.message,
                exceptionResponse.error
            );
        }

        response.code(errorCode).send(actualResponse);
    }
}

export class Exception extends HttpException {
    constructor(code: ActionMessageCodes, error?: any, message?: string) {
        const response = {
            data: takeException(code, message, error),
            prepared: true,
            statusCode: code
        };

        super(response, code);
    }
}

export function readError(error: any): string | null {
    try {
        if (typeof error === 'string') {
            return error;
        }

        if (axios.isAxiosError(error) && error?.response && error?.response?.data?.message) {
            return error.response.data.message;
        }

        if (Array.isArray(error)) {
            return error.length > 0 ? error[0] : null;
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (error && typeof error === 'object') {
            if (error.response) {
                // Axios-specific error structure
                if (error.response.data && error.response.data.message) {
                    return error.response.data.message;
                }

                if (typeof error.response.data === 'string') {
                    return error.response.data; // Handle case where the response data is a string
                }

                if (error.response.statusText) {
                    return error.response.statusText; // Fallback to HTTP status text
                }
            }

            return error.message || error.error?.message || error.toString();
        }

        return error?.toString() || null;
    } catch (e) {
        console.error('Error in readError function:', e);
        return 'unknown error';
    }
}
