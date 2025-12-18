import { ConfigReader } from './config.reader';
import { AppConfig } from './config.schema';

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
