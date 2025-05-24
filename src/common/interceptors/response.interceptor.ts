import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { appConfig } from '~/configs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const skipResponseTransform = this.reflector.get<boolean>(
            appConfig.interceptors.response.skipFormatKey,
            context.getHandler()
        ) ||
            !appConfig.interceptors.response.format;


        if (skipResponseTransform) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => {
                return {
                    statusCode: HttpStatus.OK,
                    message: 'Request successful',
                    data
                };
            }),
        );
    }
}
