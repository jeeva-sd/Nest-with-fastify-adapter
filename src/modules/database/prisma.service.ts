import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Chalk } from '~/common';
import { appConfig } from '~/configs';
import { seedDatabase } from './seed';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly chalk = new Chalk();
    private static isSeeded = false;

    async onApplicationBootstrap() {
        await this.$connect();

        if (!PrismaService.isSeeded && sql.allowSeed) {
            seedDatabase();
            this.chalk.info(`${appConfig.database.sql.database} database successfully seeded`);
            PrismaService.isSeeded = true;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
