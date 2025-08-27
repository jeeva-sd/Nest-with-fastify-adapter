import { Controller, Get } from '@nestjs/common';
import { Public } from '~/common';
import { PrismaService } from '~/modules/database';
import { appConfig } from '~/configs';

@Controller('health')
export class HealthController {
    constructor(private readonly prismaService: PrismaService) {}

    @Get()
    @Public()
    async checkHealth() {

        try {
            // Check database connectivity
            const startTime = Date.now();
            await this.prismaService.$queryRaw`SELECT 1`;
            const dbLatency = Date.now() - startTime;

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
                }
            };
        } catch (error) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
}
