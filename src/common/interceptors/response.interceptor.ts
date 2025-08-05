import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { appConfig } from '~/configs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    private readonly shouldFormat: boolean;
    private readonly skipKey: string;

    constructor(private reflector: Reflector) {
        // Cache config values to avoid repeated lookups
        this.shouldFormat = appConfig.interceptors.response.format;
        this.skipKey = appConfig.interceptors.response.skipFormatKey;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Early return if formatting is globally disabled
        if (!this.shouldFormat) {
            return next.handle();
        }

        // Check if this specific handler should skip transformation
        const skipResponseTransform = this.reflector.get<boolean>(this.skipKey, context.getHandler());

        if (skipResponseTransform) {
            return next.handle();
        }

        return next.handle().pipe(
            map(data => ({
                statusCode: HttpStatus.OK,
                message: 'Request successful',
                data
            }))
        );
    }
}
