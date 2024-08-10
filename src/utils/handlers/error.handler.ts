import { ActionMessageCodes } from './../../constants';
import { FastifyReply } from 'fastify';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { takeException } from './response.handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
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
            prepared: true
        };

        super(response, code);
    }
}

export function readError(error: any): string | null {
    try {
        if (typeof error === 'string') {
            return error;
        }

        if (Array.isArray(error)) {
            return error.length > 0 ? error[0] : null;
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (error && typeof error === 'object') {
            return error.message || error.error?.message || error.response?.data?.message || error.toString();
        }

        return error?.toString() || null;
    } catch (e) {
        console.error('Error in readError function:', e);
        return 'unknown error';
    }
}
