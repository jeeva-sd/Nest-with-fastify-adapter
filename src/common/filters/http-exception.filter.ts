import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ReplayCodes, errorMessages } from '~/constants';
import { Chalk, take } from '../interceptors';
import { appConfig } from '~/configs';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Chalk(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse = exception.getResponse();

        let statusCode: ReplayCodes = 400;
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
                        message: res.message || errorMessages[res.statusCode]?.message || 'An error occurred',
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
            if (appConfig.server.mode === 'development') {
                this.logger.exception(exception);
            }
            // Send the formatted response
            response.code(statusCode).send(formattedResponse);
        } catch (error) {
            // Handle unexpected errors in the filter itself
            this.logger.exception(error);
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
