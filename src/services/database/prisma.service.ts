import { PrismaClient } from '@prisma/client';
import { appConfig } from '~/configs/config.reader';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=${sql.performance.poolTimeout}&socket_timeout=${sql.performance.socketTimeout}&connect_timeout=${sql.performance.connectTimeout}&sslmode=PREFERRED&query_timeout=${sql.performance.queryTimeout}`;
}

export const prisma = new PrismaClient();

(async () => {
    await import('./seed').then(({ seedDatabase }) => seedDatabase());
})();
