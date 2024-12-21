import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import fastifyCors from '@fastify/cors';
import fastifyCookies from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

class AppBootstrap {
    private app: NestFastifyApplication;

    async createApp() {
        this.app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    }

    async setupPlugins() {
        await this.app.register(fastifyCors, { origin: '*' });
        await this.app.register(fastifyCookies);
        await this.app.register(fastifyMultipart);
    }

    setupVersioning() {
        this.app.setGlobalPrefix('api');
        this.app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    }

    async startServer() {
        const port = parseInt(process.env.PORT, 10) || 3000;
        const host = process.env.HOST || '0.0.0.0';
        await this.app.listen(port, host);
        Logger.log(`Application is running on: ${await this.app.getUrl()}`, 'AppBootstrap');
    }

    async bootstrap() {
        await this.createApp();
        this.setupVersioning();
        await this.setupPlugins();
        await this.startServer();
    }
}

(async () => {
    const bootstrap = new AppBootstrap();
    await bootstrap.bootstrap();
})();
