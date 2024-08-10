import * as fs from 'fs';
import * as path from 'path';
import { FastifyRequest } from 'fastify';
import {
    applyDecorators,
    SetMetadata,
    UseInterceptors,
    CallHandler,
    ExecutionContext,
} from '@nestjs/common';
import * as yup from 'yup';
import { appConfig } from 'src/config';
import { Exception } from './error.handler';
import { Helper } from '../helper';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    private uploadedFiles: string[] = [];
    constructor(private readonly schema: yup.ObjectSchema<any>) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
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

                        const filename = Helper.File.generateFilename(
                            part.filename,
                        );
                        const filePath = path.join(uploadDir, filename);

                        await fs.promises.mkdir(uploadDir, { recursive: true });
                        await fs.promises.writeFile(filePath, part.file);

                        params[part.fieldname] = filePath;
                        this.uploadedFiles.push(filePath); // Track only files for this request
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

            return next.handle().pipe(
                // Cleanup after the response is sent
                tap({
                    complete: () => this.cleanupFiles(),
                    error: () => this.cleanupFiles(),
                }),
            );
        } catch (e) {
            const message = e?.errors?.length
                ? e.errors[0]
                : 'Payload validation failed';
            throw new Exception(1003, message, 'Payload validation failed');
        }
    }

    private async cleanupFiles() {
        for (const filePath of this.uploadedFiles) {
            try {
                if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
            } catch (err) {
                console.error(
                    `Failed to delete file ${filePath}: ${err.message}`,
                );
            }
        }

        this.uploadedFiles = [];
    }
}
