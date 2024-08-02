import { FastifyReply } from 'fastify';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { customResponse, take } from './response.handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const exceptionResponse: any = exception.getResponse();
        const errorCode = exceptionResponse.code > 100 && exceptionResponse.code < 1000 ? exceptionResponse.code : 400;
        response.code(errorCode).send(exceptionResponse);
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
        const response = customResponse(HttpStatus.BAD_REQUEST, message, null, 'Validation error');

        super(response, HttpStatus.BAD_REQUEST);
    }
}

@Catch()
export class AllExceptionsFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        console.error(exception);

        response.code(status).send(customResponse(HttpStatus.INTERNAL_SERVER_ERROR, null, null, exception));
    }
}

export function readError(error: any): string | null {
    if (typeof error === 'string') return error;
    if (Array.isArray(error)) return error.length > 0 ? error[0] : null;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object') {
        const errorMessage = error.message || (error.error && error.error.message);
        if (errorMessage) return errorMessage;
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        return error.toString?.();
    }
    return error?.toString?.() || null;
}
