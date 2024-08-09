import * as fs from 'fs';
import * as path from 'path';
import { FastifyRequest } from 'fastify';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import * as yup from 'yup';
import { appConfig } from 'src/config';
import { Exception } from './error.handler';

export const Sanitize = (schema: yup.ObjectSchema<any>) => {
    return applyDecorators(
        SetMetadata('validationSchema', schema),
        UseInterceptors(new ValidationInterceptor(schema)),
    );
};

export interface RequestX extends FastifyRequest {
    user?: any;
    payload: any;
    sanitized: boolean;
}

export class ValidationInterceptor {
    constructor(private readonly schema: yup.ObjectSchema<any>) {}

    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();

        try {
            let params: any = {};

            if (request.body) params = { ...params, ...request.body };
            if (request.params) params = { ...params, ...request.params };
            if (request.query) params = { ...params, ...request.query };

            // Process multipart data
            if (request.isMultipart()) {
                const parts = await request.parts();
                for await (const part of parts) {
                    if (part.file) {
                        const uploadDir = path.join('public', 'uploads');

                        const filename = part.filename;
                        const filePath = path.join(uploadDir, filename);

                        await fs.promises.mkdir(uploadDir, { recursive: true });
                        await fs.promises.writeFile(filePath, part.file);
                        // Set buffer to a specific key, for example 'fileBuffer'
                        params[part.fieldname] = part.file;
                    } else {
                        params[part.fieldname] = part.value;
                    }
                }
            }

            const validatedPayload = await this.schema.validate(
                params,
                appConfig.get('payloadValidation'),
            );

            request.payload = validatedPayload;
            request.sanitized = true;
            return next.handle();
        } catch (e) {
            const message = e?.errors?.length
                ? e.errors[0]
                : 'Payload validation failed';
            throw new Exception(1003, message, 'Payload validation failed');
        }
    }
}
