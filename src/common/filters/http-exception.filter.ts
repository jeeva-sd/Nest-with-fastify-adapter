import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ReplayCodes, replayMessages } from '~/constants';
import { take } from '../interceptors';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse = exception.getResponse();

        let statusCode:ReplayCodes = 400;
        let formattedResponse: Record<string, any>;

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
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
                    message: res.message || replayMessages[res.statusCode]?.message || '',
                    data: null,
                    inputErrors: res?.inputErrors ?? undefined,
                };
            } else {
                formattedResponse = take(statusCode as ReplayCodes, null, res.message);
            }
        } else {
            formattedResponse = take(statusCode, null, exceptionResponse as string);
        }

        response.code(statusCode).send(formattedResponse);
    }
}

export class Exception extends HttpException {
    constructor(code: ReplayCodes = HttpStatus.BAD_REQUEST, message?: string) {
        super(
            {
                message,
                prepared: true,
                statusCode: code,
            },
            code,
        );
    }
}

// export class ValidationError extends HttpException {
//     constructor(message?: string, inputErrors?: unknown) {
//         super(
//             {
//                 message,
//                 prepared: true,
//                 statusCode: HttpStatus.BAD_REQUEST,
//                 inputErrors
//             },
//             HttpStatus.BAD_REQUEST,
//         );
//     }
// }
