import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ReplayCodes } from '../constants';
import { take } from '../interceptors';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const responseHandler = context.getResponse();
        const exceptionResponse: any = exception.getResponse();

        let formattedResponse = null;
        const errorCode =
            exceptionResponse?.statusCode > 100 && exceptionResponse?.statusCode < 1000
                ? exceptionResponse?.statusCode
                : 400;

        if (exceptionResponse.prepared) {
            formattedResponse = {
                statusCode: errorCode,
                message: exceptionResponse?.message || 'Unexpected error occurred',
                data: null
            };
        } else {
            formattedResponse = take(exceptionResponse.statusCode, null, exceptionResponse.message);
        }

        responseHandler.code(errorCode).send(formattedResponse);
    }
}

export class Exception extends HttpException {
    constructor(code: ReplayCodes = 400, message?: string) {
        const response = {
            message,
            prepared: true,
            statusCode: code
        };

        super(response, code);
    }
}
