import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { appConfig } from '~/configs';

interface PerformanceMetrics {
    requestId: string;
    method: string;
    url: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    statusCode?: number;
    userAgent?: string;
    ip?: string;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private readonly logger = new Logger(PerformanceInterceptor.name);
    private readonly metrics: Map<string, PerformanceMetrics> = new Map();

    constructor(private readonly cls: ClsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (!appConfig.monitoring.performance.enabled) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const requestId = this.cls.getId() || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();

        const metrics: PerformanceMetrics = {
            requestId,
            method: request.method,
            url: request.url,
            startTime,
            userAgent: request.headers['user-agent'],
            ip: request.ip || request.connection.remoteAddress
        };

        this.metrics.set(requestId, metrics);

        return next.handle().pipe(
            tap({
                next: () => {
                    this.completeMetrics(requestId, response.statusCode);
                },
                error: error => {
                    this.completeMetrics(requestId, error.status || 500);
                }
            })
        );
    }

    private completeMetrics(requestId: string, statusCode: number) {
        const metrics = this.metrics.get(requestId);
        if (metrics) {
            metrics.endTime = Date.now();
            metrics.duration = metrics.endTime - metrics.startTime;
            metrics.statusCode = statusCode;

            this.logPerformanceMetrics(metrics);

            // Clean up metrics after processing to free memory
            this.metrics.delete(requestId);
        }
    }

    private logPerformanceMetrics(metrics: PerformanceMetrics) {
        const { method, url, duration, statusCode } = metrics;

        if (duration > appConfig.monitoring.performance.slowRequestThreshold) {
            this.logger.warn(`SLOW REQUEST: ${method} ${url} - ${duration}ms (${statusCode})`);
        } else if (duration > appConfig.monitoring.performance.mediumRequestThreshold) {
            this.logger.log(`MEDIUM REQUEST: ${method} ${url} - ${duration}ms (${statusCode})`);
        }
    }

    // Get current performance statistics
    getStats() {
        return {
            activeRequests: this.metrics.size
        };
    }
}
