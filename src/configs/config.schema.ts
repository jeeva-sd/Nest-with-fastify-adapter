import * as z from 'zod';

const serverConfigSchema = z.object({
    logger: z.boolean(),
    bodyLimit: z.number(),
    caseSensitive: z.boolean(),
    ignoreTrailingSlash: z.boolean(),
    ignoreDuplicateSlashes: z.boolean(),
    port: z.number(),
    routePrefix: z.string(),
    version: z.string(),
    mode: z.enum(['development', 'production']),
    allowExceptionLogs: z.boolean()
});

const payloadConfigSchema = z.object({
    abortEarly: z.boolean(),
    stripUnknown: z.boolean(),
    recursive: z.boolean(),
    decoratorKey: z.string()
});

const multipartConfigSchema = z.object({
    limits: z.object({
        fileSize: z.number(),
        fieldSize: z.number(),
        fields: z.number(),
        files: z.number()
    })
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

const corsConfigSchema = z.object({
    allowedDomains: z.array(z.string().trim()),
    credentials: z.boolean()
});

export const staticConfigSchema = z.object({
    staticRoot: z.string(),
    staticPrefix: z.string()
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

// -------------------------------------------- Compression --------------------------------------------

export const compressionConfigSchema = z.object({
    encodings: z.array(z.enum(['gzip', 'deflate', 'br'])), // Validate supported encodings
    threshold: z.number().min(0), // Minimum threshold for compression
    brotliOptions: z.object({
        params: z.object({
            BROTLI_PARAM_QUALITY: z.number().min(0).max(11) // Brotli quality range: 0-11
        })
    })
});

// -------------------------------------------- RabbitMQ --------------------------------------------

export const rabbitMQSchema = z.object({
    general: z.object({
        name: z.string(),
        options: z.object({
            urls: z.array(z.string()).min(1),
            queue: z.string(),
            noAck: z.boolean(),
            queueOptions: z.object({
                durable: z.boolean()
            })
        })
    })
});

// ----------------------------------------------------------------------------------------------------------

export const AppConfigRule = z.object({
    server: serverConfigSchema,
    cors: corsConfigSchema,
    auth: authConfigSchema,
    payloadValidation: payloadConfigSchema,
    interceptors: interceptorSchema,
    staticFiles: staticConfigSchema,
    views: viewEngineSchema,
    multiPart: multipartConfigSchema,
    compression: compressionConfigSchema,
    rabbitMq: rabbitMQSchema
});

// ------------------------------------------------------------------------------------------------------------------

export type AppConfig = z.infer<typeof AppConfigRule>;

// ------------------------------------------------------------------------------------------------------------------
