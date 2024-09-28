import * as yup from 'yup';

const serverConfigRule = yup.object().shape({
    logger: yup.boolean(),
    bodyLimit: yup.number(),
    caseSensitive: yup.boolean(),
    ignoreTrailingSlash: yup.boolean(),
    ignoreDuplicateSlashes: yup.boolean()
});

const payloadConfigRule = yup.object().shape({
    abortEarly: yup.boolean().default(true),
    stripUnknown: yup.boolean().default(true),
    recursive: yup.boolean().default(true)
});

const multipartConfigRule = yup.object().shape({
    limits: yup.object().shape({
        fileSize: yup.number().default(5242880), // 5MB
        fieldSize: yup.number().default(1024 * 1024), // 1MB
        fields: yup.number().default(10),
        files: yup.number().default(5)
    })
});

const authConfigRule = yup.object().shape({
    jwt: yup.object().shape({
        secret: yup.string().required(),
        expiresIn: yup.string().default('7d') // 7 days
    })
});

const staticPathConfigRule = yup.object().shape({
    folder: yup.string().required(),
    prefix: yup.string().default('/static/')
});

const corsConfigRule = yup.object().shape({
    allowedDomains: yup.array().of(yup.string().trim().required()).required(),
    credentials: yup.boolean().default(true)
});

export const AppConfigRule = yup.object().shape({
    appPort: yup.number().required(),
    appPrefix: yup.string().default('api'),
    server: serverConfigRule,
    cors: corsConfigRule,
    auth: authConfigRule,
    static: staticPathConfigRule,
    payloadValidation: payloadConfigRule,
    multiPart: multipartConfigRule
});

// ------------------------------------------------------------------------------------------------------------------

type AppConfig = yup.InferType<typeof AppConfigRule>;
type AuthConfig = yup.InferType<typeof authConfigRule>;
type ServerOptionsConfig = yup.InferType<typeof serverConfigRule>;
type PayloadValidationConfig = yup.InferType<typeof payloadConfigRule>;
type MultipartOptions = yup.InferType<typeof multipartConfigRule>;

// ------------------------------------------------------------------------------------------------------------------

export type { AppConfig, AuthConfig, PayloadValidationConfig, ServerOptionsConfig, MultipartOptions };
