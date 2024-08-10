import { FastifyAdapter as AppAdapter, NestFastifyApplication as Application } from '@nestjs/platform-fastify';
import multiPart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { HttpExceptionFilter, readError } from './utils';

class Bootstrap {
    private logger: Logger;

    constructor() {
        this.logger = new Logger('Bootstrap');
    }

    async start() {
        try {
            const app: Application = await this.createApp();

            await this.registerPluginsAndFilters(app);
            await this.enableVersioning(app);

            await this.listen(app);
        } catch (error) {
            this.logger.error(`Failed to bootstrap application: ${readError(error)}`);
            process.exit(1);
        }
    }

    private async createApp(): Promise<Application> {
        const appAdapter = new AppAdapter(appConfig.get('server'));
        return await NestFactory.create<Application>(AppModule, appAdapter);
    }

    private async registerPluginsAndFilters(app: Application) {
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.register(multiPart, appConfig.get('multiPart'));
    }

    private async enableVersioning(app: Application) {
        app.setGlobalPrefix(appConfig.get('appPrefix'));
        app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    }

    private async listen(app: Application) {
        await app.listen(appConfig.get('appPort'));
        this.logger.log(`Listening on port ${appConfig.get('appPort')}`);
    }
}

// -----------------------------------------------------------------------------------------------------------------

async function startServer() {
    const app = new Bootstrap();
    await app.start();
}

startServer();
