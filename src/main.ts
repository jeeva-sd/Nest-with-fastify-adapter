import { join } from 'node:path';
import { constants } from 'node:zlib';
import compression from '@fastify/compress';
import fastifyCookies from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { fastifyStatic } from '@fastify/static';
import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as chalk from 'chalk';
import {
    Chalk,
    HttpExceptionFilter,
    PayloadGuard,
    ResponseTransformInterceptor,
    appendCommitHash,
    fileCleaner
} from '~/common';
import { AppModule } from './app.module';
import { appConfig } from './configs';

class App {
    private app: NestFastifyApplication;

    // Create the NestJS app using the Fastify adapter
    async createApp() {
        this.app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
            logger: new Chalk()
        });
    }

    // Set up Fastify hooks
    setupHooks() {
        const appInstance = this.app.getHttpAdapter().getInstance();
        appInstance.addHook('onSend', async (_request, reply, payload) => appendCommitHash(_request, reply, payload)); // Hook to set a commit hash in header
        appInstance.addHook('onResponse', async request => fileCleaner(request)); // Hook to clean up uploaded files after the response is sent
    }

    // Register Fastify plugins: cookies, multipart, CORS, Helmet, CSRF
    async setupPlugins() {
        await Promise.all([
            this.app.register(fastifyCookies),
            this.app.register(fastifyMultipart, appConfig.multiPart),
            this.app.register(fastifyCors, {
                origin: appConfig.cors.allowedDomains,
                credentials: appConfig.cors.credentials
            }),
            this.app.register(fastifyStatic, {
                root: join(__dirname, '..', appConfig.staticFiles.staticRoot),
                prefix: appConfig.staticFiles.staticPrefix
            }),
            this.app.register(fastifyHelmet),
            this.app.register(fastifyCsrf),
            this.app.register(compression, {
                encodings: appConfig.compression.encodings,
                threshold: appConfig.compression.threshold,
                brotliOptions: {
                    params: {
                        [constants.BROTLI_PARAM_QUALITY]:
                            appConfig.compression.brotliOptions.params.BROTLI_PARAM_QUALITY
                    }
                }
            })
        ]);
    }

    // Enable URI-based versioning
    setupVersioning() {
        this.app.setGlobalPrefix(appConfig.server.routePrefix);
        this.app.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: appConfig.server.version
        });
    }

    // Set up global guards
    setupGuards() {
        const reflector = this.app.get(Reflector);
        this.app.useGlobalGuards(new PayloadGuard(reflector));
    }

    // Set up global error filters
    setUpFilters() {
        this.app.useGlobalFilters(new HttpExceptionFilter());
    }

    // Set up global interceptors
    setUpInterceptor() {
        const reflector = this.app.get(Reflector);
        this.app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));
    }

    // Start listening on the configured port
    async startServer() {
        const port = appConfig.server.port;
        await this.app.listen(port);
        Logger.log(chalk.cyan(`Application is running on: ${await this.app.getUrl()}`));
    }

    // Enable shutdown hooks for cleanup
    async enableShutdownHooks() {
        this.app.enableShutdownHooks();
    }

    setupViewEngine() {
        this.app.setViewEngine({
            engine: {
                [appConfig.views.engine]: require(appConfig.views.engine)
            },
            templates: join(__dirname, '../..', appConfig.views.templatesDir)
        });
    }

    // Bootstrap sequence
    async bootstrap() {
        await this.createApp();
        this.setupHooks();
        await this.setupPlugins();
        this.setupVersioning();
        this.setupGuards();
        this.setUpFilters();
        this.setUpInterceptor();
        this.setupViewEngine();
        await this.enableShutdownHooks();
        await this.startServer();
    }
}

(async () => {
    const app = new App();
    await app.bootstrap();
})();
