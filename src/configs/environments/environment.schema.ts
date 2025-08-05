import * as z from 'zod';

const serverConfigSchema = z.object({
    port: z.number(),
    routePrefix: z.string(),
    version: z.string(),
    mode: z.enum(['development', 'staging', 'production']),
    host: z.string(),
    allowExceptionLogs: z.boolean(),
    bufferLogs: z.boolean(),
    abortOnError: z.boolean()
});

// Fastify adapter configuration schema
const fastifyConfigSchema = z.object({
    adapter: z.object({
        logger: z.boolean(),
        trustProxy: z.boolean(),
        ignoreTrailingSlash: z.boolean(),
        ignoreDuplicateSlashes: z.boolean(),
        caseSensitive: z.boolean(),
        maxParamLength: z.number(),
        bodyLimit: z.number()
    }),
    hooks: z.object({
        performanceLogging: z.boolean(),
        slowRequestThreshold: z.number(),
        enableRequestTiming: z.boolean()
    })
});

const pluginsConfigSchema = z.object({
    helmet: z.object({
        enabled: z.boolean()
    }),
    cors: z.object({
        enabled: z.boolean(),
        origin: z.array(z.string().trim()),
        credentials: z.boolean(),
        methods: z.array(z.string().trim())
    }),
    cookies: z.object({
        enabled: z.boolean()
    }),
    multipart: z.object({
        enabled: z.boolean(),
        attachFieldsToBody: z.boolean(),
        sharedSchemaId: z.string(),
        limits: z.object({
            fileSize: z.number(),
            fieldSize: z.number(),
            fields: z.number(),
            files: z.number()
        })
    }),
    csrf: z.object({
        enabled: z.boolean()
    }),
    static: z.object({
        enabled: z.boolean(),
        root: z.string(),
        prefix: z.string(),
        maxAge: z.number().min(0, 'Max age must be a non-negative number'),
        etag: z.boolean(),
        lastModified: z.boolean(),
        immutable: z.boolean(),
        cacheControl: z.boolean()
    }),
    rateLimit: z.object({
        enabled: z.boolean(),
        max: z.number().int().positive(),
        timeWindow: z.string(),
        allowList: z.array(z.string()),
        ban: z.number().int().nonnegative().optional(),
        skipOnError: z.boolean(),
        addHeaders: z.boolean()
    }),
    compression: z.object({
        enabled: z.boolean(),
        encodings: z.array(z.enum(['gzip', 'deflate', 'br'])),
        threshold: z.number().min(0),
        zlibLevel: z.number(),
        chunkSize: z.number(),
        contentTypeFilter: z.string(),
        brotliOptions: z.object({
            params: z.object({
                BROTLI_PARAM_QUALITY: z.number().min(0).max(11)
            })
        })
    })
});

const payloadConfigSchema = z.object({
    abortEarly: z.boolean(),
    stripUnknown: z.boolean(),
    recursive: z.boolean(),
    decoratorKey: z.string()
});

const authConfigSchema = z.object({
    publicAuthKey: z.string(),
    skipJwtAuthKey: z.string(),
    encryptionKey: z.string(),
    roleKey: z.string(),
    permissionKey: z.string(),
    basicJWT: z.object({
        name: z.string(),
        secret: z.string(),
        expiresIn: z.string()
    })
});

export const viewEngineSchema = z.object({
    engine: z.enum(['handlebars', 'ejs', 'pug', 'eta']),
    templatesDir: z.string()
});

export const interceptorSchema = z.object({
    response: z.object({
        format: z.boolean(),
        formatKey: z.string(),
        skipFormatKey: z.string()
    })
});

// -------------------------------------------- Database --------------------------------------------

const sqlRule = z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
    username: z.string().min(1),
    password: z.string().min(1),
    database: z.string().min(1),
    connectionLimit: z.number(),
    allowSeed: z.boolean(),
    performance: z.object({
        poolTimeout: z.number(),
        socketTimeout: z.number(),
        connectTimeout: z.number(),
        queryTimeout: z.number()
    })
});

const databaseRule = z.object({ sql: sqlRule });

// Microservices configuration schema with consolidated RabbitMQ config
const microservicesConfigSchema = z.object({
    rabbitmq: z.object({
        enabled: z.boolean(),
        continueOnFailure: z.boolean(),
        uri: z
            .string()
            .min(1, { message: 'RabbitMQ URI is required' })
            .regex(/^amqp(s)?:\/\/.+/, { message: 'Invalid AMQP URI format' }),
        exchange: z.object({
            name: z.string().min(1, { message: 'Exchange name is required' }),
            type: z.string().min(1, { message: 'Exchange type is required' }),
            options: z.object({
                arguments: z.object({
                    'x-delayed-type': z.string().min(1, {
                        message: 'x-delayed-type is required'
                    })
                })
            })
        }),
        queues: z.object({
            general: z.object({
                name: z.string().min(1),
                prefetchCount: z
                    .number()
                    .int({ message: 'prefetchCount must be an integer' })
                    .positive({ message: 'prefetchCount must be positive' }),
                durable: z.boolean()
            }),
            singleConsumerQueue: z.object({
                name: z.string().min(1),
                prefetchCount: z
                    .number()
                    .int({ message: 'prefetchCount must be an integer' })
                    .positive({ message: 'prefetchCount must be positive' }),
                durable: z.boolean()
            })
        })
    })
});

// Monitoring configuration schemas
const monitoringConfigSchema = z.object({
    performance: z.object({
        enabled: z.boolean(),
        slowRequestThreshold: z.number(),
        mediumRequestThreshold: z.number(),
        fastRequestThreshold: z.number()
    }),
    memory: z.object({
        enabled: z.boolean(),
        warningThreshold: z.number(),
        criticalThreshold: z.number(),
        checkInterval: z.number()
    }),
    startup: z.object({
        logProcessInfo: z.boolean()
    })
});

// Graceful shutdown configuration schema
const gracefulShutdownConfigSchema = z.object({
    enabled: z.boolean(),
    signals: z.array(z.string()),
    logShutdown: z.boolean()
});

// ----------------------------------------------------------------------------------------------------------

export const AppConfigRule = z.object({
    server: serverConfigSchema,
    fastify: fastifyConfigSchema,
    plugins: pluginsConfigSchema,
    microservices: microservicesConfigSchema,
    monitoring: monitoringConfigSchema,
    gracefulShutdown: gracefulShutdownConfigSchema,
    auth: authConfigSchema,
    payloadValidation: payloadConfigSchema,
    interceptors: interceptorSchema,
    views: viewEngineSchema,
    database: databaseRule
});

// ------------------------------------------------------------------------------------------------------------------

export type AppConfig = z.infer<typeof AppConfigRule>;

// ------------------------------------------------------------------------------------------------------------------
