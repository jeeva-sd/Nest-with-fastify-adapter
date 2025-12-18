import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import { appConfig } from '~/configs';
import { ResponseX } from '../types/replay.type';
import { readError } from '../utils/error-reader';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse() as ResponseX;
        const traceId = appConfig.server.allowExceptionLogs ? createId() : undefined;

        const { status, message, error } = this.resolveException(exception);

        if (appConfig.server.allowExceptionLogs) {
            this.logger.error(exception, traceId);
        }

        response.code(status).send({
            statusCode: status,
            message,
            traceId,
            timestamp: new Date().toISOString()
        });
    }

    private resolveException(exception: unknown): {
        status: number;
        message: string;
        error: unknown;
    } {
        if (exception instanceof HttpException) {
            return {
                status: exception.getStatus(),
                message: readError(exception),
                error: exception.getResponse()
            };
        }

        if (exception instanceof Prisma.PrismaClientValidationError) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Database validation error',
                error: exception
            };
        }

        if (
            exception instanceof Prisma.PrismaClientKnownRequestError ||
            exception instanceof Prisma.PrismaClientUnknownRequestError ||
            exception instanceof Prisma.PrismaClientInitializationError ||
            exception instanceof Prisma.PrismaClientRustPanicError
        ) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Database error',
                error: exception
            };
        }

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            error: exception
        };
    }
}
