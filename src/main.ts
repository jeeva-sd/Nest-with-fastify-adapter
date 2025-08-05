import { join } from 'node:path';
import compression from '@fastify/compress';
import fastifyCookies from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import { fastifyStatic } from '@fastify/static';
import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as chalk from 'chalk';
import {
    Chalk,
    HttpExceptionFilter,
    PayloadGuard,
    RequestX,
    ResponseTransformInterceptor,
    fileCleaner
} from '~/common';
import { AppModule } from './app.module';
import { appConfig } from './configs';
import { RABBIT_MQ_QUEUE_KEYS, createRmqMicroserviceOptions } from './services';

class App {
    private app: NestFastifyApplication;
    private reflector: Reflector;

    async createApp() {
        const chalkLogger = new Chalk();

        const fastifyAdapter = new FastifyAdapter({
            logger: appConfig.fastify.adapter.logger,
            trustProxy: appConfig.fastify.adapter.trustProxy, // Enable if behind reverse proxy (load balancer, nginx)
            ignoreTrailingSlash: appConfig.fastify.adapter.ignoreTrailingSlash, // Treat /api/users and /api/users/ as same route
            ignoreDuplicateSlashes: appConfig.fastify.adapter.ignoreDuplicateSlashes, // Treat /api//users as /api/users
            caseSensitive: appConfig.fastify.adapter.caseSensitive, // Make routes case insensitive
            maxParamLength: appConfig.fastify.adapter.maxParamLength // Maximum length for URL parameters
        });

        this.app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
            logger: chalkLogger,
            bufferLogs: appConfig.server.bufferLogs, // Buffer logs during startup for better performance
            abortOnError: appConfig.server.abortOnError // Continue startup even if some modules fail
        });

        // Cache reflector instance for reuse across guards and interceptors
        this.reflector = this.app.get(Reflector);
    }

    // Set up Fastify hooks
    setupHooks() {
        const appInstance = this.app.getHttpAdapter().getInstance();

        // Add performance monitoring hook
        if (appConfig.fastify.hooks.enableRequestTiming) {
            appInstance.addHook('onRequest', async (request: RequestX) => {
                request.startTime = Date.now(); // Track request start time for performance monitoring
            });
        }

        // File cleanup hook
        appInstance.addHook('onResponse', async (request: RequestX) => {
            // Log response time in development if performance logging is enabled
            if (
                appConfig.fastify.hooks.performanceLogging &&
                appConfig.server.mode === 'development' &&
                request.startTime
            ) {
                const duration = Date.now() - request.startTime;
                if (duration > appConfig.fastify.hooks.slowRequestThreshold) {
                    console.log(`Slow request: ${request.method} ${request.url} - ${duration}ms`);
                }
            }

            // Always cleanup files asynchronously without blocking the response
            setImmediate(() => fileCleaner(request));
        });
    }

    // Register Fastify plugins based on configuration with proper ordering and settings
    async setupPlugins() {
        // Security plugins first (critical for security)
        if (appConfig.plugins.helmet.enabled) {
            await this.app.register(fastifyHelmet); // Adds security headers like CSP, HSTS, etc.
        }

        // Register core plugins in parallel where dependencies allow
        const corePlugins = [];

        if (appConfig.plugins.cors.enabled) {
            corePlugins.push(
                this.app.register(fastifyCors, {
                    origin: appConfig.plugins.cors.origin, // Allowed domains for CORS requests
                    credentials: appConfig.plugins.cors.credentials, // Allow credentials in CORS requests
                    methods: appConfig.plugins.cors.methods // Allowed HTTP methods
                })
            );
        }

        if (appConfig.plugins.cookies.enabled) {
            corePlugins.push(this.app.register(fastifyCookies)); // Enable cookie parsing and signing
        }

        await Promise.all(corePlugins);

        // Register multipart plugin with performance optimizations
        if (appConfig.plugins.multipart.enabled) {
            await this.app.register(fastifyMultipart, {
                limits: appConfig.plugins.multipart.limits, // File size and field limits
                attachFieldsToBody: appConfig.plugins.multipart.attachFieldsToBody, // Prevent automatic parsing to body for better performance
                sharedSchemaId: appConfig.plugins.multipart.sharedSchemaId // Enable schema sharing for validation
            });
        }

        // Register CSRF protection
        if (appConfig.plugins.csrf.enabled) {
            await this.app.register(fastifyCsrf); // CSRF protection for state-changing operations
        }

        // Register static file serving with optimization settings
        if (appConfig.plugins.static.enabled) {
            await this.app.register(fastifyStatic, {
                root: join(__dirname, '..', appConfig.plugins.static.root), // Root directory for static files
                prefix: appConfig.plugins.static.prefix, // URL prefix for static files
                cacheControl: appConfig.plugins.static.cacheControl, // Enable Cache-Control headers
                maxAge: appConfig.plugins.static.maxAge, // Cache duration for static files
                etag: appConfig.plugins.static.etag, // Enable ETags for better caching
                lastModified: appConfig.plugins.static.lastModified, // Enable Last-Modified headers
                immutable: appConfig.plugins.static.immutable // Mark static assets as immutable for better caching
            });
        }

        // Configure rate limiting with settings from config if enabled
        if (appConfig.plugins.rateLimit.enabled) {
            const rateLimitConfig: {
                max: number;
                timeWindow: string;
                allowList: string[];
                skipOnError: boolean;
                ban?: number;
                addHeadersOnExceeding?: {
                    'x-ratelimit-limit': boolean;
                    'x-ratelimit-remaining': boolean;
                    'x-ratelimit-reset': boolean;
                };
            } = {
                max: appConfig.plugins.rateLimit.max, // Maximum requests per time window
                timeWindow: appConfig.plugins.rateLimit.timeWindow, // Time window for rate limiting
                allowList: appConfig.plugins.rateLimit.allowList, // IPs exempt from rate limiting
                skipOnError: appConfig.plugins.rateLimit.skipOnError // Don't block requests if rate limiter fails
            };

            // Add ban configuration if specified
            if (appConfig.plugins.rateLimit.ban) {
                rateLimitConfig.ban = appConfig.plugins.rateLimit.ban;
            }

            // Add rate limit headers if enabled
            if (appConfig.plugins.rateLimit.addHeaders) {
                rateLimitConfig.addHeadersOnExceeding = {
                    'x-ratelimit-limit': true,
                    'x-ratelimit-remaining': true,
                    'x-ratelimit-reset': true
                };
            }

            await this.app.register(fastifyRateLimit, rateLimitConfig);
        }

        // Compression settings
        if (appConfig.plugins.compression.enabled) {
            await this.app.register(compression, {
                encodings: appConfig.plugins.compression.encodings, // Supported compression encodings
                threshold: appConfig.plugins.compression.threshold, // Minimum response size to compress
                brotliOptions: appConfig.plugins.compression.brotliOptions, // Brotli compression options
                zlibOptions: {
                    level: appConfig.plugins.compression.zlibLevel, // Balance between compression ratio and speed
                    chunkSize: appConfig.plugins.compression.chunkSize // Chunk size for streaming compression
                },
                // Only compress specific content types for better performance
                customTypes: new RegExp(appConfig.plugins.compression.contentTypeFilter)
            });
        }
    }

    // Enable URI-based versioning using configuration
    setupVersioning() {
        this.app.setGlobalPrefix(appConfig.server.routePrefix); // API route prefix
        this.app.enableVersioning({
            type: VersioningType.URI, // Use URI-based versioning
            defaultVersion: appConfig.server.version // Default API version
        });
    }

    // Set up global guards
    setupGuards() {
        this.app.useGlobalGuards(new PayloadGuard(this.reflector)); // Global payload validation and sanitization
    }

    // Set up global error filters
    setUpFilters() {
        this.app.useGlobalFilters(new HttpExceptionFilter()); // Global exception handling
    }

    // Set up global interceptors
    setUpInterceptors() {
        this.app.useGlobalInterceptors(new ResponseTransformInterceptor(this.reflector)); // Global response formatting
    }

    // Start listening on the configured port with host binding
    async startServer() {
        const port = appConfig.server.port; // Server port from configuration
        const host = appConfig.server.host; // Server host binding from configuration

        await this.app.listen(port, host);
        const url = await this.app.getUrl();
        Logger.log(chalk.cyan(`Application is running on: ${url}`));

        // Log additional startup information
        if (appConfig.monitoring.startup.logProcessInfo) {
            Logger.log(chalk.green(`Process ID: ${process.pid}`));
            Logger.log(chalk.green(`Environment: ${appConfig.server.mode}`));
            Logger.log(chalk.green(`Node version: ${process.version}`));
        }
    }

    // Enable shutdown hooks for graceful cleanup
    async enableShutdownHooks() {
        this.app.enableShutdownHooks();

        // Add graceful shutdown handlers
        if (appConfig.gracefulShutdown.enabled) {
            appConfig.gracefulShutdown.signals.forEach(signal => {
                process.on(signal as NodeJS.Signals, () => {
                    if (appConfig.gracefulShutdown.logShutdown) {
                        Logger.log(`${signal} received, shutting down gracefully`);
                    }
                    this.app.close();
                });
            });
        }
    }

    // Set up the view engine using configuration
    setupViewEngine() {
        this.app.setViewEngine({
            engine: {
                [appConfig.views.engine]: require(appConfig.views.engine) // Template engine (handlebars, ejs, etc.)
            },
            templates: join(__dirname, '../..', appConfig.views.templatesDir) // Templates directory
        });
    }

    // Set up RabbitMQ microservices with error handling and configuration
    async setUpMicroservices() {
        // Only set up microservices if RabbitMQ is enabled
        if (!appConfig.microservices.rabbitmq.enabled) {
            return;
        }

        try {
            // Connect microservices sequentially for simplicity
            this.app.connectMicroservice(createRmqMicroserviceOptions(RABBIT_MQ_QUEUE_KEYS.GENERAL));
            this.app.connectMicroservice(createRmqMicroserviceOptions(RABBIT_MQ_QUEUE_KEYS.SINGLE_CONSUMER));

            await this.app.startAllMicroservices();
            Logger.log(chalk.green('All microservices started successfully'));

            // Log RabbitMQ connection info
            if (appConfig.monitoring.startup.logProcessInfo) {
                Logger.log(chalk.green(`RabbitMQ connected to: ${appConfig.microservices.rabbitmq.uri}`));
                Logger.log(
                    chalk.green(
                        `Exchange: ${appConfig.microservices.rabbitmq.exchange.name} (${appConfig.microservices.rabbitmq.exchange.type})`
                    )
                );
            }
        } catch (error) {
            Logger.error('Failed to start microservices:', error);

            // Continue without microservices if configured to do so
            if (!appConfig.microservices.rabbitmq.continueOnFailure) {
                throw error;
            }
        }
    }

    async bootstrap() {
        try {
            // Core app creation
            await this.createApp();

            // Setup hooks
            this.setupHooks();

            // Plugin setup (sequential due to dependencies)
            await this.setupPlugins();

            // Application configuration
            await Promise.all([
                Promise.resolve(this.setupVersioning()),
                Promise.resolve(this.setupGuards()),
                Promise.resolve(this.setUpFilters()),
                Promise.resolve(this.setUpInterceptors()),
                Promise.resolve(this.setupViewEngine()),
                this.enableShutdownHooks()
            ]);

            // Start services
            await Promise.all([this.setUpMicroservices(), this.startServer()]);
        } catch (error) {
            Logger.error('Failed to bootstrap application:', error);
            process.exit(1);
        }
    }
}

(async () => {
    const app = new App();
    await app.bootstrap();
})();
