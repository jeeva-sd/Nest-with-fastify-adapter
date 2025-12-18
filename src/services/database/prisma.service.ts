import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { appConfig } from '~/configs';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=${sql.performance.poolTimeout}&socket_timeout=${sql.performance.socketTimeout}&connect_timeout=${sql.performance.connectTimeout}&sslmode=PREFERRED&query_timeout=${sql.performance.queryTimeout}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        // Seed database if allowed
        if (appConfig.database.sql.allowSeed) {
            await import('./seed').then(({ seedDatabase }) => seedDatabase(this));
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
