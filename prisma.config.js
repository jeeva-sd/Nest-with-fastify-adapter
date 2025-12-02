require('dotenv').config();

// Register tsconfig-paths first to resolve ~ alias
require('tsconfig-paths/register');

// Register ts-node
require('ts-node').register({
    project: 'tsconfig.ext.json',
    transpileOnly: true,
    compilerOptions: { module: 'commonjs' }
});

// Now safely load TS modules using "~"
const { appConfig } = require('~/configs');
const { defineConfig, env } = require('prisma/config');

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}`;
}

module.exports = defineConfig({
    datasource: {
        url: env('DATABASE_URL')
    }
});
