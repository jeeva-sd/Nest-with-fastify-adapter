import { Controller, Get } from '@nestjs/common';
import { Public } from '~/common';
import { appConfig } from '~/configs';
import { PrismaService } from '../../services';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService, private readonly prisma: PrismaService) {}

    @Get()
    @Public()
    async checkHealth() {
        try {
            // Check database connectivity
            const startTime = Date.now();
            await this.prisma.$queryRaw`SELECT 1`;
            const dbLatency = Date.now() - startTime;

            const memoryInfo = this.healthService.getMemoryInfo();

            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: appConfig.server.mode,
                version: process.env.npm_package_version || '1.0.0',
                services: {
                    database: {
                        status: 'healthy',
                        latency: `${dbLatency}ms`
                    },
                    rabbitmq: {
                        status: appConfig.microservices.rabbitmq.enabled ? 'enabled' : 'disabled'
                    }
                },
                memory: memoryInfo
            };
        } catch (error) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error
            };
        }
    }
}
