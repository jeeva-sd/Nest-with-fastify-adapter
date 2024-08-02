import { FastifyReply } from 'fastify';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { customResponse, take, takeException } from './response.handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const exceptionResponse: any = exception.getResponse();
        const errorCode =
            exceptionResponse.statusCode > 100 &&
            exceptionResponse.statusCode < 1000
                ? exceptionResponse.statusCode
                : 400;

        response
            .code(errorCode)
            .send(
                takeException(
                    errorCode,
                    exceptionResponse.message,
                    exceptionResponse.error,
                ),
            );
    }
}

export class Exception extends HttpException {
    constructor(code: number, message?: string) {
        let response = null;

        if (code) response = take(code);
        else response = customResponse(HttpStatus.BAD_REQUEST, message);

        super(response, HttpStatus.BAD_REQUEST);
    }
}

export class ValidationError extends HttpException {
    constructor(message?: string) {
        const response = customResponse(
            HttpStatus.BAD_REQUEST,
            message,
            null,
            'Validation error',
        );

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
