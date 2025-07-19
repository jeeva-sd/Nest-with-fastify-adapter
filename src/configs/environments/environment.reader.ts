import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@nestjs/common';
import * as chalk from 'chalk';
import { z } from 'zod/v4';
import { AppConfig, AppConfigRule } from './environment.schema';

export class ConfigReader {
    private static instance: ConfigReader;
    private readonly logger = new Logger(ConfigReader.name);
    public config: AppConfig;

    private constructor() {
        const env = process.env.NODE_ENV || 'development';
        console.log(chalk.yellow(`Loading ${env} environment...\n`));

        try {
            // Construct absolute paths to the JSON configuration files
            const basePath = path.resolve(process.cwd(), 'envs/base.json');
            const envPath = path.resolve(process.cwd(), `envs/${env}.json`);

            // Read and parse the JSON configurations
            const baseConfig = this.readConfigFile(basePath);
            const envConfig = this.readConfigFile(envPath);

            // Merge the base and environment configurations
            const mergedConfigs = this.mergeConfigs(baseConfig, envConfig);

            // Validate and initialize the configuration
            this.config = this.applyValidation(mergedConfigs as AppConfig);
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

    private readConfigFile(filePath: string): Partial<AppConfig> {
        try {
            if (!fs.existsSync(filePath)) {
                this.logger.error(`Configuration file not found: ${filePath}`);
                return {};
            }
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContent) as Partial<AppConfig>;
        } catch (error) {
            this.logger.error(`Error reading configuration file: ${filePath}`);
            throw error;
        }
    }

    private mergeConfigs(baseConfig: Partial<AppConfig>, envConfig: Partial<AppConfig>): Partial<AppConfig> {
        for (const key of Object.keys(envConfig)) {
            if (typeof envConfig[key] === 'object' && envConfig[key] !== null && !Array.isArray(envConfig[key])) {
                if (!(key in baseConfig)) baseConfig[key] = {};
                baseConfig[key] = this.mergeConfigs(baseConfig[key], envConfig[key]);
            } else {
                // Only override base value if property exists in envConfig
                if (key in envConfig) baseConfig[key] = envConfig[key];
            }
        }

        return baseConfig;
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
}

export const appConfig = ConfigReader.getInstance().getAll();
