import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, VersioningType } from '@nestjs/common';
import fastifyCors from '@fastify/cors';
import fastifyCookies from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { Chalk } from './common';
import { appConfig } from './configs';

class App {
    private app: NestFastifyApplication;

    async createApp() {
        this.app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
            logger: new Chalk()
        });
    }

    async setupPlugins() {
        await this.app.register(fastifyCookies);
        await this.app.register(fastifyMultipart, appConfig.multiPart);
        await this.app.register(fastifyCors, {
            origin: appConfig.cors.allowedDomains,
            credentials: appConfig.cors.credentials
        });
    }

    setupVersioning() {
        this.app.setGlobalPrefix(appConfig.server.routePrefix);
        this.app.enableVersioning({ type: VersioningType.URI, defaultVersion: appConfig.server.version });
    }

    async startServer() {
        const port = appConfig.server.port;
        await this.app.listen(port);
        Logger.log(`Application is running on: ${await this.app.getUrl()}`);
    }

    async bootstrap() {
        await this.createApp();
        this.setupVersioning();
        await this.setupPlugins();
        await this.startServer();
    }
}

(async () => {
    const app = new App();
    await app.bootstrap();
})();
