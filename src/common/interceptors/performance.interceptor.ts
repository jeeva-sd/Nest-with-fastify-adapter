import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClsService } from 'nestjs-cls';

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
    private readonly metrics: Map<string, PerformanceMetrics> = new Map();
    private readonly isDev: boolean;

    constructor(private readonly cls: ClsService) {
        this.isDev = process.env.NODE_ENV === 'development';
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
                error: (error) => {
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

            if (this.isDev) {
                this.logPerformanceMetrics(metrics);
            }

            // Clean up metrics after processing
            this.metrics.delete(requestId);
        }
    }

    private logPerformanceMetrics(metrics: PerformanceMetrics) {
        const { method, url, duration, statusCode } = metrics;

        if (duration > 1000) {
            console.warn(`🐌 SLOW REQUEST: ${method} ${url} - ${duration}ms (${statusCode})`);
        } else if (duration > 500) {
            console.log(`⚠️  MEDIUM REQUEST: ${method} ${url} - ${duration}ms (${statusCode})`);
        } else if (duration > 100) {
            console.log(`⚡ FAST REQUEST: ${method} ${url} - ${duration}ms (${statusCode})`);
        }
    }

    // Get current performance statistics
    getStats() {
        return {
            activeRequests: this.metrics.size,
            isDevelopment: this.isDev
        };
    }
}

// Memory usage monitor
export class MemoryMonitor {
    private static instance: MemoryMonitor;
    private readonly thresholds = {
        warning: 50 * 1024 * 1024, // 50MB
        critical: 100 * 1024 * 1024 // 100MB
    };

    static getInstance(): MemoryMonitor {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }

    private constructor() {
        if (process.env.NODE_ENV === 'development') {
            this.startMonitoring();
        }
    }

    private startMonitoring() {
        // Check memory usage every 30 seconds in development
        setInterval(() => {
            const usage = process.memoryUsage();
            const heapUsed = usage.heapUsed;

            if (heapUsed > this.thresholds.critical) {
                console.error(`🚨 CRITICAL: High memory usage: ${this.formatBytes(heapUsed)}`);
            } else if (heapUsed > this.thresholds.warning) {
                console.warn(`⚠️  WARNING: Elevated memory usage: ${this.formatBytes(heapUsed)}`);
            }
        }, 30000);
    }

    private formatBytes(bytes: number): string {
        return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
    }

    getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            rss: this.formatBytes(usage.rss),
            heapTotal: this.formatBytes(usage.heapTotal),
            heapUsed: this.formatBytes(usage.heapUsed),
            external: this.formatBytes(usage.external)
        };
    }
}

// Initialize memory monitor
MemoryMonitor.getInstance();