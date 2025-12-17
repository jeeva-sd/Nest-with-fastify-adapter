import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { appConfig } from '~/configs';
import { seedDatabase } from './seed';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=${sql.performance.poolTimeout}&socket_timeout=${sql.performance.socketTimeout}&connect_timeout=${sql.performance.connectTimeout}&sslmode=PREFERRED&query_timeout=${sql.performance.queryTimeout}`;
}

const adapter = new PrismaMariaDb({
    host: sql.host,
    port: Number(sql.port) || 3306,
    user: sql.username,
    password: sql.password,
    database: sql.database,
    connectionLimit: sql.connectionLimit
});

export const prisma = new PrismaClient({ adapter });

seedDatabase();
