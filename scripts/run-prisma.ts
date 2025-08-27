// First set environment variable before any imports
const env = process.env.NODE_ENV;

if (!env) {
    console.error('NODE_ENV is not set. Please set it to "development", "production" or "test".');
    process.exit(1);
}

// Register tsconfig paths to resolve ~ aliases
require('tsconfig-paths/register');

import { spawnSync } from 'node:child_process';

const [, , ...prismaArgs] = process.argv;

if (!prismaArgs.length) {
    console.error('No Prisma command provided');
    process.exit(1);
}

async function runPrismaCommand() {
    try {
        const { ConfigReader } = await import('~/configs/environments/environment.reader');

        // Get the config instance
        const appConfig = ConfigReader.getInstance().config;

        // Extract database configuration
        const dbConfig = appConfig.database?.sql || {};
        const { username, password, host, port, database } = dbConfig;

        const DATABASE_URL = `mysql://${username}:${password}@${host}:${port}/${database}?connection_limit=${1}`;
        console.log(`Using DATABASE_URL: mysql://${username}:***@${host}:${port}/${database}`);

        // Run Prisma command with the constructed DATABASE_URL
        const result = spawnSync('npx', ['prisma', ...prismaArgs], {
            stdio: 'inherit',
            env: {
                ...process.env,
                DATABASE_URL
            }
        });

        process.exit(result.status ?? 0);
    } catch (error) {
        console.error('Failed to load configuration:', error.message);
        process.exit(1);
    }
}

runPrismaCommand();
