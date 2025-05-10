import * as yup from 'yup';

// ------------------------------------------- server -----------------------------------------------------

const serverConfigSchema = yup.object().shape({
    logger: yup.boolean().required(),
    bodyLimit: yup.number().required(),
    caseSensitive: yup.boolean().required(),
    ignoreTrailingSlash: yup.boolean().required(),
    ignoreDuplicateSlashes: yup.boolean().required(),
    port: yup.number().required(),
    routePrefix: yup.string().required(),
    version: yup.string().required(),
    mode: yup.string().oneOf(['development', 'production']).required()
});

const payloadConfigSchema = yup.object().shape({
    abortEarly: yup.boolean().required(),
    stripUnknown: yup.boolean().required(),
    recursive: yup.boolean().required(),
    decoratorKey: yup.string().required()
});

const multipartConfigSchema = yup.object().shape({
    limits: yup.object().shape({
        fileSize: yup.number().required(),
        fieldSize: yup.number().required(),
        fields: yup.number().required(),
        files: yup.number().required()
    })
});

const authConfigSchema = yup.object().shape({
    publicAuthKey: yup.string().required(),
    skipJwtAuthKey: yup.string().required(),
    encryptionKey: yup.string().required(),
    roleKey: yup.string().required(),
    permissionKey: yup.string().required(),
    basicJWT: yup.object().shape({
        name: yup.string().required(),
        secret: yup.string().required(),
        expiresIn: yup.string().required()
    })
});

const corsConfigSchema = yup.object().shape({
    allowedDomains: yup.array().of(yup.string().trim().required()).required(),
    credentials: yup.boolean().required()
});

export const staticConfigSchema = yup.object({
    staticRoot: yup.string().required(),
    staticPrefix: yup.string().required()
});

export const viewEngineSchema = yup.object({
    engine: yup.string().oneOf(['handlebars', 'ejs', 'pug', 'eta']).required(),
    templatesDir: yup.string().required()
});

export const interceptorSchema = yup.object({
    response: yup
        .object({
            format: yup.boolean().required(),
            formatKey: yup.string().required(),
            skipFormatKey: yup.string().required()
        })
        .required()
});

// -------------------------------------------- RabbitMQ --------------------------------------------

export const rabbitMQSchema = yup.object({
    general: yup
        .object({
            name: yup.string().required(),
            options: yup
                .object({
                    urls: yup.array().of(yup.string().required()).min(1).required(),
                    queue: yup.string().required(),
                    noAck: yup.boolean().required(),
                    queueOptions: yup
                        .object({
                            durable: yup.boolean().required()
                        })
                        .required()
                })
                .required()
        })
        .required()
});

// ----------------------------------------------------------------------------------------------------------

export const AppConfigRule = yup.object().shape({
    server: serverConfigSchema,
    cors: corsConfigSchema,
    auth: authConfigSchema,
    payloadValidation: payloadConfigSchema,
    interceptors: interceptorSchema,
    staticFiles: staticConfigSchema,
    views: viewEngineSchema,
    multiPart: multipartConfigSchema,
    rabbitMq: rabbitMQSchema
});

// ------------------------------------------------------------------------------------------------------------------

export type AppConfig = yup.InferType<typeof AppConfigRule>;

// ------------------------------------------------------------------------------------------------------------------
