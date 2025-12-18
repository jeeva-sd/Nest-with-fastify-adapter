import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import { appConfig } from '~/configs';
import { readError } from '../utils/error-reader';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const traceId = appConfig.server.allowExceptionLogs ? createId() : undefined;

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorDetails: unknown = null;

        // Handle Prisma errors
        if (this.isPrismaError(exception)) {
            const prismaError = this.handlePrismaError(exception as Prisma.PrismaClientKnownRequestError);
            status = prismaError.status;
            message = prismaError.message;
            errorDetails = prismaError.error; // Include raw error details
        } else if (exception instanceof HttpException) {
            // Handle HttpException
            status = exception.getStatus();
            message = readError(exception);
            errorDetails = exception.getResponse(); // Include raw error details
        } else {
            // Handle unknown errors
            errorDetails = exception;
        }

        // Log the exception with trace ID
        if (appConfig.server.allowExceptionLogs) {
            this.logger.error(exception, traceId);
        }

        // Send the response
        response.code(status).send({
            statusCode: status,
            message,
            traceId,
            timestamp: new Date().toISOString(),
            error: errorDetails
        });
    }

    private isPrismaError(exception: unknown): boolean {
        return (
            exception instanceof Prisma.PrismaClientKnownRequestError ||
            exception instanceof Prisma.PrismaClientUnknownRequestError ||
            exception instanceof Prisma.PrismaClientRustPanicError ||
            exception instanceof Prisma.PrismaClientInitializationError ||
            exception instanceof Prisma.PrismaClientValidationError
        );
    }

    private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError | unknown): {
        status: number;
        message: string;
        error: unknown;
    } {
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'A database error occurred', // Simple message for the client
                error: exception // Include raw error details
            };
        } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An unknown database error occurred',
                error: exception
            };
        } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'A database panic occurred',
                error: exception
            };
        } else if (exception instanceof Prisma.PrismaClientInitializationError) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Database initialization error',
                error: exception
            };
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'A validation error occurred',
                error: exception
            };
        }

        // Fallback for unknown Prisma errors
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected database error occurred',
            error: exception
        };
    }
}
