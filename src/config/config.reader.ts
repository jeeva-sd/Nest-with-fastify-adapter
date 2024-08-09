import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { AppConfig, AppConfigSchema } from './config.schema';

export class ConfigReader {
    private static instance: ConfigReader;
    public config: AppConfig;
    public readonly logger = new Logger(ConfigReader.name);

    private constructor() {
        const env = process.env.NODE_ENV || 'development';
        this.logger.debug(`Loading ${env} environment`);

        // Construct absolute paths to the JSON configuration files
        const basePath = path.resolve(__dirname, '../../envs/base.json');
        const envPath = path.resolve(__dirname, `../../envs/${env}.json`);

        // Read and parse the JSON configurations
        const baseConfig = JSON.parse(
            fs.readFileSync(basePath, 'utf8'),
        ) as AppConfig;
        const envConfig = JSON.parse(
            fs.readFileSync(envPath, 'utf8'),
        ) as Partial<AppConfig>;

        // Merge the base and environment configurations
        const mergedConfigs = this.mergeConfigs(baseConfig, envConfig);

        // Validate and initialize the configuration
        this.config = this.applyValidation(mergedConfigs);
    }

    public static getInstance(): ConfigReader {
        if (!ConfigReader.instance) {
            ConfigReader.instance = new ConfigReader();
        }
        return ConfigReader.instance;
    }

    private applyValidation(mergedConfigs: AppConfig): AppConfig {
        try {
            return AppConfigSchema.validateSync(mergedConfigs, {
                abortEarly: false,
            });
        } catch (error) {
            this.logger.error('Configuration validation error:', error);
            process.exit(1);
        }
    }

    private mergeConfigs(
        baseConfig: AppConfig,
        envConfig: Partial<AppConfig>,
    ): AppConfig {
        for (const key of Object.keys(envConfig)) {
            if (
                typeof envConfig[key] === 'object' &&
                envConfig[key] !== null &&
                !Array.isArray(envConfig[key])
            ) {
                if (!(key in baseConfig)) baseConfig[key] = {};
                baseConfig[key] = this.mergeConfigs(
                    baseConfig[key],
                    envConfig[key] as Partial<AppConfig>,
                );
            } else {
                // Only override base value if property exists in envConfig
                if (key in envConfig) baseConfig[key] = envConfig[key];
            }
        }
        return baseConfig;
    }

    public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.config[key];
    }
}
