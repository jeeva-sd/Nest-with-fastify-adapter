import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import { AxiosError } from 'axios';
import { appConfig } from '~/configs/config.reader';
import { readError } from '../utils/error-reader';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse();
        const traceId = appConfig.server.allowExceptionLogs ? createId() : undefined;

        const { status, message } = this.resolve(exception);

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

    private resolve(exception: unknown): {
        status: number;
        message: string;
    } {
        // Nest / HTTP errors
        if (exception instanceof HttpException) {
            return {
                status: exception.getStatus(),
                message: readError(exception)
            };
        }

        // Axios / external HTTP errors
        if (exception instanceof AxiosError) {
            return {
                status: exception.response?.status ?? HttpStatus.BAD_GATEWAY,
                message: exception.response?.data?.message ?? exception.message
            };
        }

        // Prisma errors
        if (exception instanceof Prisma.PrismaClientValidationError) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: 'Database validation error'
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
                message: 'Database error'
            };
        }

        // Generic JS errors
        if (exception instanceof Error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: exception.message
            };
        }

        // Fallback
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error'
        };
    }
}
