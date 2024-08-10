import * as yup from 'yup';

const serverOptionsSchema = yup.object().shape({
    logger: yup.boolean(),
    bodyLimit: yup.number(),
    caseSensitive: yup.boolean(),
    ignoreTrailingSlash: yup.boolean(),
    ignoreDuplicateSlashes: yup.boolean(),
});

const payloadValidationSchema = yup.object().shape({
    abortEarly: yup.boolean().default(true),
    stripUnknown: yup.boolean().default(true),
    recursive: yup.boolean().default(true),
});

const multipartOptionsSchema = yup.object().shape({
    limits: yup.object().shape({
        fileSize: yup.number().default(5242880), // 5MB
        fieldSize: yup.number().default(1024 * 1024), // 1MB
        fields: yup.number().default(10),
        files: yup.number().default(5),
    }),
});

const authSchema = yup.object().shape({
    jwt: yup.object().shape({
        secret: yup.string().required(),
        expiresIn: yup.string().default('7d'), // 7 days
    }),
});

export const AppConfigSchema = yup.object().shape({
    appPort: yup.number().required(),
    appPrefix: yup.string().default('api'),
    server: serverOptionsSchema,
    auth: authSchema,
    payloadValidation: payloadValidationSchema,
    multiPart: multipartOptionsSchema,
});

// ------------------------------------------------------------------------------------------------------------------

type AppConfig = yup.InferType<typeof AppConfigSchema>;
type AuthConfig = yup.InferType<typeof authSchema>;
type ServerOptionsConfig = yup.InferType<typeof serverOptionsSchema>;
type PayloadValidationConfig = yup.InferType<typeof payloadValidationSchema>;
type MultipartOptions = yup.InferType<typeof multipartOptionsSchema>;

// ------------------------------------------------------------------------------------------------------------------

export type {
    AppConfig,
    AuthConfig,
    PayloadValidationConfig,
    ServerOptionsConfig,
    MultipartOptions,
};
