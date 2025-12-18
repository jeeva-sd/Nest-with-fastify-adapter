import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { appConfig } from '~/configs';

@Injectable()
export class HealthService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(HealthService.name);
    private memoryCheckInterval: NodeJS.Timeout | null = null;
    private isChecking = false;

    onModuleInit() {
        if (appConfig.monitoring.startup.logProcessInfo) {
            this.logger.log(`Process ID: ${process.pid}`);
            this.logger.log(`Environment: ${appConfig.server.mode}`);
            this.logger.log(`Node version: ${process.version}`);
        }

        if (appConfig.monitoring.memory.enabled) {
            this.memoryCheckInterval = setInterval(
                () => this.checkMemoryUsage(),
                appConfig.monitoring.memory.checkInterval
            );

            // Do not keep the process alive because of this interval
            this.memoryCheckInterval.unref();
        }
    }

    onModuleDestroy() {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
        }
    }

    private checkMemoryUsage() {
        if (this.isChecking) return;
        this.isChecking = true;

        try {
            const memUsage = process.memoryUsage();
            const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            const rssMB = Math.round(memUsage.rss / 1024 / 1024);

            if (heapUsedMB > appConfig.monitoring.memory.criticalThreshold) {
                this.logger.error(
                    `Heap ${heapUsedMB} MB, RSS ${rssMB} MB (critical: ${appConfig.monitoring.memory.criticalThreshold} MB)`
                );
            } else if (heapUsedMB > appConfig.monitoring.memory.warningThreshold) {
                this.logger.warn(
                    `Heap ${heapUsedMB} MB, RSS ${rssMB} MB (warning: ${appConfig.monitoring.memory.warningThreshold} MB)`
                );
            }
        } finally {
            this.isChecking = false;
        }
    }

    getMemoryInfo(): {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
        arrayBuffers: number;
    } {
        const memUsage = process.memoryUsage();

        return {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
            arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
        };
    }
}
