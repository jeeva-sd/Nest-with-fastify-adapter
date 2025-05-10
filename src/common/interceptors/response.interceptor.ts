import { ReplayCodes, errorMessages } from '~/constants';
import { ResponseX } from '../types';
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

// Common function to build a ResponseX
const buildResponseX = (statusCode: number, data: any = null, message?: string): ResponseX => {
    const replayMessage = message ?? errorMessages[statusCode]?.message ?? null;

    return {
        statusCode,
        message: replayMessage,
        data
    };
};

// Specific functions
export const take = (code: ReplayCodes = 200, data?: unknown, message?: string): ResponseX => {
    return buildResponseX(code, data, message);
};

const dataFound = (data: any): ResponseX => {
    return buildResponseX(1000, data);
};

const dataNotFound = (data: any = []): ResponseX => {
    return buildResponseX(1001, data);
};

export const dataList = (data: any): ResponseX => {
    if (!data) return dataNotFound();
    if (data?.hasOwnProperty('total') && data.total === 0) return dataNotFound(data);
    if (Array.isArray(data) && data.length > 0) return dataFound(data);
    if (typeof data === 'object' && Object.keys(data).length > 0) return dataFound(data);
    return dataNotFound();
};

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const skipTransform = this.reflector.get<boolean>(
            appConfig.interceptors.response.skipFormatKey,
            context.getHandler()
        ) ||
            !appConfig.interceptors.response.format;


        if (skipTransform) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => {
                return {
                    statusCode: HttpStatus.OK,
                    message: 'Request successful',
                    data: data && data.data !== undefined ? data.data : data,
                };
            }),
        );
    }
}
