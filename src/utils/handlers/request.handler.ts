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
import { Exception, readError } from './error.handler';
import { Helper } from '../helper';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ALL_FILE_TYPES } from 'src/constants';

export interface RequestX extends FastifyRequest {
    user?: any;
    payload: any;
    sanitized: boolean;
}

export interface FileSchemaOverrides {
    allowedMimeTypes?: string[];
    minFileSize?: number; // Minimum file size in MB
    maxFileSize?: number; // Maximum file size in MB
}

export const Sanitize = (schema: yup.ObjectSchema<any>) => {
    return applyDecorators(
        SetMetadata('validationSchema', schema),
        UseInterceptors(new ValidationInterceptor(schema)),
    );
};

export const createFileRule = (overrides: FileSchemaOverrides = {}) => {
    return yup.object().shape({
        mimetype: yup
            .string()
            .oneOf(overrides.allowedMimeTypes || ALL_FILE_TYPES)
            .required(),
        filePath: yup.string().required(),
        fileSize: yup
            .number()
            .min(overrides.minFileSize || 0) // Size in MB
            .max(overrides.maxFileSize || 1) // Default max size 1MB in MB
            .required(),
    });
};

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

                        const fileBytes = Buffer.byteLength(
                            await Helper.File.readFile(filePath),
                        );

                        params[part.fieldname] = {
                            mimetype: part.mimetype,
                            filePath,
                            fileSize: Helper.File.convertBytes(fileBytes, 'MB'),
                        };

                        this.uploadedFiles.push(filePath);
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
            this.cleanupFiles();

            const message = e?.errors?.length
                ? e.errors[0]
                : (readError(e) ?? 'Payload validation failed');
            throw new Exception(1003, 'Invalid input payload', message);
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
