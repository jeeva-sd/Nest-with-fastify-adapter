import * as yup from 'yup';

// ------------------------------------------- server -----------------------------------------------------

const serverConfigRule = yup.object().shape({
    logger: yup.boolean().required(),
    bodyLimit: yup.number().required(),
    caseSensitive: yup.boolean().required(),
    ignoreTrailingSlash: yup.boolean().required(),
    ignoreDuplicateSlashes: yup.boolean().required(),
    port: yup.number().required(),
    routePrefix: yup.string().required(),
    version: yup.string().required()
});

const payloadConfigRule = yup.object().shape({
    abortEarly: yup.boolean().required(),
    stripUnknown: yup.boolean().required(),
    recursive: yup.boolean().required(),
    decoratorKey: yup.string().required()
});

const multipartConfigRule = yup.object().shape({
    limits: yup.object().shape({
        fileSize: yup.number().required(),
        fieldSize: yup.number().required(),
        fields: yup.number().required(),
        files: yup.number().required()
    })
});

const authConfigRule = yup.object().shape({
    publicAuthKey: yup.string().required(),
    skipJwtAuthKey: yup.string().required(),
    encryptionKey: yup.string().required(),
    roleKey: yup.string().required(),
    jwt: yup.object().shape({
        secret: yup.string().required(),
        expiresIn: yup.string().required()
    })
});

const corsConfigRule = yup.object().shape({
    allowedDomains: yup.array().of(yup.string().trim().required()).required(),
    credentials: yup.boolean().required()
});

// ----------------------------------------------------------------------------------------------------------

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
    server: serverConfigRule,
    cors: corsConfigRule,
    auth: authConfigRule,
    payloadValidation: payloadConfigRule,
    multiPart: multipartConfigRule,
    rabbitMq: rabbitMQSchema
});

// ------------------------------------------------------------------------------------------------------------------

export type AppConfig = yup.InferType<typeof AppConfigRule>;

// ------------------------------------------------------------------------------------------------------------------
