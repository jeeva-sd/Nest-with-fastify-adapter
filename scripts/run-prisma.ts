import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const [, , ...prismaArgs] = process.argv;

if (!prismaArgs.length) {
    console.error('No Prisma command provided');
    process.exit(1);
}

// Determine NODE_ENV or default to 'development'
const env = process.env.NODE_ENV || 'development';

// Helper to read and parse JSON files safely
function readJson(filePath: string): Record<string, any> {
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: Config file not found: ${filePath}`);
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_error) {
        console.error(`Failed to parse JSON file: ${filePath}`);
        process.exit(1);
    }
}

// Helper to deep merge objects
function mergeDeep(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// Load configuration files
const baseConfigPath = path.resolve(process.cwd(), 'envs/base.json');
const envConfigPath = path.resolve(process.cwd(), `envs/${env}.json`);

const baseConfig = readJson(baseConfigPath);
const envConfig = readJson(envConfigPath);

const config = mergeDeep(baseConfig, envConfig);

// Extract database configuration with defaults
const dbConfig = config.database?.sql || {};
const { username, password, host, port, database, connectionLimit } = dbConfig;

const DATABASE_URL = `mysql://${username}:${password}@${host}:${port}/${database}?connection_limit=${connectionLimit}`;

// Run Prisma command with the constructed DATABASE_URL
const result = spawnSync('npx', ['prisma', ...prismaArgs], {
    stdio: 'inherit',
    env: {
        ...process.env,
        DATABASE_URL
    }
});

process.exit(result.status ?? 0);
