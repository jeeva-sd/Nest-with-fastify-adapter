import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, AppConfigRule } from './config.schema';
import * as chalk from 'chalk';
import { readError } from 'src/common';

export class ConfigReader {
    private static instance: ConfigReader;
    public config: AppConfig;

    private constructor() {
        const env = process.env.NODE_ENV || 'development';
        console.log(chalk.yellow(`Loading ${env} environment...\n`));

        // Construct absolute paths to the JSON configuration files
        const basePath = path.resolve(process.cwd(), 'envs/base.json');
        const envPath = path.resolve(process.cwd(), `envs/${env}.json`);

        // Read and parse the JSON configurations
        const baseConfig = JSON.parse(fs.readFileSync(basePath, 'utf8')) as AppConfig;
        const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf8')) as Partial<AppConfig>;

        // Merge the base and environment configurations
        const mergedConfigs = this.mergeConfigs(baseConfig, envConfig);

        // Validate and initialize the configuration
        this.config = this.applyValidation(mergedConfigs);
    }

    public static getInstance(): ConfigReader {
        if (!ConfigReader.instance) ConfigReader.instance = new ConfigReader();
        return ConfigReader.instance;
    }

    private applyValidation(mergedConfigs: AppConfig): AppConfig {
        try {
            return AppConfigRule.validateSync(mergedConfigs, { abortEarly: false });
        } catch (e) {
            const error = e?.errors?.length
                ? e.errors.map((error, index) => `${index + 1}. ${error}`).join(' \n')
                : (readError(e) ?? 'Config validation failed');
            console.log(chalk.red(`ENV Configuration validation error: \n${error}`));
            process.exit(1);
        }
    }

    private mergeConfigs(baseConfig: AppConfig, envConfig: Partial<AppConfig>): AppConfig {
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

    public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
        return this.config[key];
    }
}
