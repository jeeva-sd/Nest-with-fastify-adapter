import { FastifyReply } from 'fastify';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { takeException } from './response.handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const exceptionResponse: any = exception.getResponse();
        console.log(exceptionResponse, 'exceptionResponse');
        let actualResponse = null;

        const errorCode =
            exceptionResponse.statusCode > 100 &&
            exceptionResponse.statusCode < 1000
                ? exceptionResponse.statusCode
                : 400;

        if (exceptionResponse.prepared) {
            actualResponse = exceptionResponse.data;
        } else {
            actualResponse = takeException(
                exceptionResponse.errorCode,
                exceptionResponse.message,
                exceptionResponse.error,
            );
        }

        response.code(errorCode).send(actualResponse);
    }
}

export class Exception extends HttpException {
    constructor(code: number, message?: string, error?: any) {
        const response = {
            data: undefined,
            prepared: true,
        };

        if (code) {
            response.data = takeException(code, message, error);
        } else {
            response.data = takeException(HttpStatus.BAD_REQUEST, message);
        }

        super(response, HttpStatus.BAD_REQUEST);
    }
}

export function readError(error: any): string | null {
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) return error.length > 0 ? error[0] : null;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object') {
        const errorMessage =
            error.message || (error.error && error.error.message);
        if (errorMessage) return errorMessage;
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            return error.response.data.message;
        }
        return error.toString?.();
    }
    return error?.toString?.() || null;
}
