import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { ReplayCodes, replayMessages } from '~/constants';
import { take } from '../interceptors';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse = exception.getResponse();

        let statusCode:ReplayCodes = 400;
        let formattedResponse: Record<string, any>;

        try {
            if (typeof exceptionResponse === 'string') {
                formattedResponse = take(statusCode, null, exceptionResponse);
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse as {
                    statusCode?: ReplayCodes;
                    message?: string;
                    prepared?: boolean;
                    inputErrors?: unknown;
                };

                const isValidCode = res.statusCode && res.statusCode >= 100 && res.statusCode < 600;
                statusCode = isValidCode ? res.statusCode : HttpStatus.BAD_REQUEST as ReplayCodes;

                if (res.prepared) {
                    formattedResponse = {
                        statusCode,
                        message: res.message || replayMessages[res.statusCode]?.message || 'An error occurred',
                        data: null,
                        inputErrors: res.inputErrors ?? undefined,
                    };
                } else {
                    formattedResponse = take(statusCode, null, res.message);
                }
            } else {
                formattedResponse = take(statusCode, null, 'An unexpected error occurred');
            }

            // Log the exception for debugging
            this.logger.error('Exception caught:', exception.message, exception.stack);

            // Send the formatted response
            response.code(statusCode).send(formattedResponse);
        } catch (error) {
            // Handle unexpected errors in the filter itself
            this.logger.error('Error in HttpExceptionFilter:', error.message, error.stack);
            response.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                data: null,
            });
        }
    }
}

export class Exception extends HttpException {
    constructor(
        code: ReplayCodes = HttpStatus.BAD_REQUEST,
        message?: string,
        inputErrors?: unknown,
    ) {
        super(
            {
                message,
                prepared: true,
                statusCode: code,
                inputErrors,
            },
            code,
        );
    }
}
