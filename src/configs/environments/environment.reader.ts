import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@nestjs/common';
import { z } from 'zod/v4';
import { AppConfig, AppConfigRule } from './environment.schema';

export class ConfigReader {
    private static instance: ConfigReader;
    private readonly logger = new Logger(ConfigReader.name);
    public config: AppConfig;
    private static readonly configCache = new Map<string, Partial<AppConfig>>();

    private constructor() {
        const env = process.env.NODE_ENV;

        try {
            // Use cached config if available (for testing/hot reload scenarios)
            const cacheKey = `${env}_config`;
            if (ConfigReader.configCache.has(cacheKey)) {
                this.config = ConfigReader.configCache.get(cacheKey) as AppConfig;
                return;
            }

            // Construct absolute paths to the JSON configuration files
            const basePath = path.resolve(process.cwd(), 'envs/base.json');
            const envPath = path.resolve(process.cwd(), `envs/${env}.json`);

            // Read configurations in parallel
            const [baseConfig, envConfig] = this.readConfigFilesParallel(basePath, envPath);

            // Merge the base and environment configurations
            const mergedConfigs = this.mergeConfigs(baseConfig, envConfig);

            // Validate and initialize the configuration
            this.config = this.applyValidation(mergedConfigs as AppConfig);

            // Cache the validated config
            ConfigReader.configCache.set(cacheKey, this.config);
        } catch (error) {
            this.logger.error(`Failed to load configuration: ${error.message}`);
            process.exit(1);
        }
    }

    public static getInstance(): ConfigReader {
        if (!ConfigReader.instance) {
            ConfigReader.instance = new ConfigReader();
        }
        return ConfigReader.instance;
    }

    private readConfigFilesParallel(basePath: string, envPath: string): [Partial<AppConfig>, Partial<AppConfig>] {
        try {
            const baseExists = fs.existsSync(basePath);
            const envExists = fs.existsSync(envPath);

            if (!baseExists) {
                this.logger.warn(`Base configuration file not found: ${basePath}`);
            }
            if (!envExists) {
                this.logger.warn(`Environment configuration file not found: ${envPath}`);
            }

            const baseConfig = baseExists ? JSON.parse(fs.readFileSync(basePath, 'utf8')) : {};
            const envConfig = envExists ? JSON.parse(fs.readFileSync(envPath, 'utf8')) : {};

            return [baseConfig, envConfig];
        } catch (error) {
            this.logger.error('Error reading configuration files');
            throw error;
        }
    }

    private mergeConfigs(baseConfig: Partial<AppConfig>, envConfig: Partial<AppConfig>): Partial<AppConfig> {
        const result = { ...baseConfig };

        for (const [key, value] of Object.entries(envConfig)) {
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.mergeConfigs((result[key] as Partial<AppConfig>) || {}, value as Partial<AppConfig>);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    private applyValidation(mergedConfigs: AppConfig): AppConfig {
        try {
            return AppConfigRule.parse(mergedConfigs);
        } catch (e) {
            this.logger.error(`Configuration validation failed:\n${z.prettifyError(e)}`);
            process.exit(1);
        }
    }

    public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.config[key];
    }

    public getAll(): AppConfig {
        return this.config;
    }

    public static clearCache(): void {
        ConfigReader.configCache.clear();
    }
}

// Create a singleton instance with lazy loading
let configInstance: AppConfig | null = null;

export const appConfig = new Proxy({} as AppConfig, {
    get(_target, prop) {
        if (!configInstance) {
            configInstance = ConfigReader.getInstance().getAll();
        }
        return configInstance[prop as keyof AppConfig];
    }
});
