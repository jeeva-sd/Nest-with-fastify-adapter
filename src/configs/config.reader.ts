import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@nestjs/common';
import * as chalk from 'chalk';
import { merge } from 'lodash';
import { readError } from '~/common';
import { AppConfig, AppConfigRule } from './config.schema';

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
            const mergedConfigs = merge(baseConfig, envConfig);

            // Validate and initialize the configuration
            this.config = this.applyValidation(mergedConfigs);
        } catch (error) {
            this.logger.error(`Failed to load configuration: ${readError(error)}`);
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

    private applyValidation(mergedConfigs: AppConfig): AppConfig {
        try {
            return AppConfigRule.validateSync(mergedConfigs, { abortEarly: false });
        } catch (e) {
            const errors = e?.errors?.length
                ? e.errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
                : readError(e) || 'Config validation failed';
            this.logger.error(`ENV Configuration validation error:\n${errors}`);
            process.exit(1);
        }
    }

    public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.config[key];
    }
}
