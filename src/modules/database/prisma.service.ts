import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { Chalk } from '~/common';
import { appConfig } from '~/configs';
import { seedDatabase } from './seed';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=20&sslmode=PREFERRED`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly chalk = new Chalk();
    private static isSeeded = false;

    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            },
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' }
            ],
            errorFormat: 'pretty'
        });

        // Log slow queries in development
        if (appConfig.server.mode === 'development') {
            this.$on('query' as never, (e: Prisma.QueryEvent) => {
                if (e.duration > 50) {
                    // Log queries taking more than 1 second
                    this.chalk.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
                }
            });
        }
    }

    async onApplicationBootstrap() {
        await this.$connect();

        if (!PrismaService.isSeeded && sql.allowSeed) {
            seedDatabase();
            PrismaService.isSeeded = true;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
