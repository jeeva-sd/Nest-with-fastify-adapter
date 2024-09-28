import { join } from 'path';
import { FastifyAdapter as AppAdapter, NestFastifyApplication as Application } from '@nestjs/platform-fastify';
import multiPart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { Chalk, HttpExceptionFilter } from './utils';

class Bootstrap {
    private chalk: Chalk;

    constructor() {
        this.chalk = new Chalk(Bootstrap.name);
    }

    async start() {
        try {
            const app: Application = await this.createApp();

            await this.registerPluginsAndFilters(app);
            await this.enableVersioning(app);

            await this.listen(app);
        } catch (error) {
            this.chalk.exception(error);
            process.exit(1);
        }
    }

    private async createApp(): Promise<Application> {
        const appAdapter = new AppAdapter(appConfig.get('server'));
        return await NestFactory.create<Application>(AppModule, appAdapter, {
            logger: new Chalk()
        });
    }

    private async registerPluginsAndFilters(app: Application) {
        app.useGlobalFilters(new HttpExceptionFilter());

        await app.register(multiPart, appConfig.get('multiPart'));
        await app.register(fastifyCookie);
        await app.register(fastifyStatic, {
            root: join(__dirname, '..', appConfig.get('static').folder),
            prefix: appConfig.get('static').prefix
        });
        await app.register(fastifyCors, {
            origin: appConfig.get('cors').allowedDomains,
            credentials: appConfig.get('cors').credentials
        });
    }

    private async enableVersioning(app: Application) {
        app.setGlobalPrefix(appConfig.get('appPrefix'));
        app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    }

    private async listen(app: Application) {
        await app.listen(appConfig.get('appPort'));
        this.chalk.info(`Listening on port ${appConfig.get('appPort')}`);
    }
}

// -----------------------------------------------------------------------------------------------------------------

async function startServer() {
    const app = new Bootstrap();
    await app.start();
}

startServer();
