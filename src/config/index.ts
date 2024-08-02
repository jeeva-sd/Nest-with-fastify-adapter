import { ConfigReader } from './config.reader';

export const appConfig = () => new ConfigReader().config;
