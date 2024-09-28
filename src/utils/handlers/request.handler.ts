import * as fs from 'fs';
import * as path from 'path';
import { FastifyRequest } from 'fastify';
import { applyDecorators, SetMetadata, UseInterceptors, CallHandler, ExecutionContext } from '@nestjs/common';
import * as yup from 'yup';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appConfig } from 'src/config';
import { ALL_FILE_TYPES } from 'src/constants';
import { Exception, readError } from './error.handler';
import { Helper } from '../helper';

export interface RequestX extends FastifyRequest {
    payload?: any;
    sanitized?: boolean;
}

export interface FileSchemaOverrides {
    allowedMimeTypes?: string[];
    minFileSize?: number; // Minimum file size in MB
    maxFileSize?: number; // Maximum file size in MB
    required?: boolean;
}

export const Sanitize = (schema: yup.ObjectSchema<any>) => {
    return applyDecorators(SetMetadata('validationSchema', schema), UseInterceptors(new ValidationInterceptor(schema)));
};

const MB_TO_KB = 1024;

export const createFileRule = (overrides: FileSchemaOverrides = {}) => {
    const {
        allowedMimeTypes = ALL_FILE_TYPES,
        minFileSize = 0,
        maxFileSize = 1,
        required = false // Default to false if not provided
    } = overrides;

    const fileSchema = yup.object().shape({
        mimetype: yup.string().oneOf(allowedMimeTypes, 'Invalid file mimetype').required('File type is required'),
        fileName: yup.string().required('Invalid file name'),
        filePath: yup.string().required('File path is required'),
        fileSize: yup
            .number()
            .min(minFileSize, `File size must be at least ${minFileSize} MB (${minFileSize * MB_TO_KB} KB)`)
            .max(maxFileSize, `File size must be less than ${maxFileSize} MB (${maxFileSize * MB_TO_KB} KB)`)
            .typeError('Invalid file parameters')
            .required('Invalid file size')
    });

    return yup
        .array()
        .of(fileSchema)
        .typeError('Invalid file parameters')
        .when([], {
            is: () => required,
            then: schema => schema.required()
        });
};

export class ValidationInterceptor {
    private uploadedFiles: string[] = [];
    constructor(private readonly schema: yup.ObjectSchema<any>) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        let params: any = {};

        try {
            if (request.body) params = { ...params, ...request.body };
            if (request.params) params = { ...params, ...request.params };
            if (request.query) params = { ...params, ...request.query };

            // Process multipart data
            if (request.isMultipart()) {
                const parts = await request.parts();
                for await (const part of parts) {
                    if (part.file) {
                        const files = Array.isArray(part.file) ? part.file : [part.file];

                        for (const file of files) {
                            const uploadDir = path.join('public', 'uploads');
                            const fileName = Helper.File.generateFilename(part.filename);
                            const filePath = path.join(uploadDir, fileName);

                            await fs.promises.mkdir(uploadDir, { recursive: true });
                            await fs.promises.writeFile(filePath, file);

                            const fileBytes = Buffer.byteLength(await Helper.File.readFile(filePath));
                            const fileSizeInMB = Helper.File.convertBytes(fileBytes, 'MB');

                            // Initialize the field in params if not already
                            if (!params[part.fieldname]) {
                                params[part.fieldname] = [];
                            }

                            // Add file details to the field array
                            params[part.fieldname].push({
                                mimetype: part.mimetype,
                                filePath,
                                fileSize: fileSizeInMB,
                                fileName
                            });

                            this.uploadedFiles.push(filePath);
                        }
                    } else {
                        params[part.fieldname] = part.value;
                    }
                }
            }

            const validatedPayload = await this.schema.validate(params, appConfig.get('payloadValidation'));
            request.payload = validatedPayload;
            request.sanitized = true;

            return next.handle().pipe(
                // Cleanup after the response is sent
                tap({
                    complete: () => this.cleanupFiles(),
                    error: () => this.cleanupFiles()
                })
            );
        } catch (e) {
            this.cleanupFiles();

            const message = e?.errors?.length ? e.errors[0] : (readError(e) ?? 'Payload validation failed');
            throw new Exception(1003, 'Invalid input payload', message);
        }
    }

    private async cleanupFiles() {
        for (const filePath of this.uploadedFiles) {
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error(`Failed to delete file ${filePath}: ${err.message}`);
            }
        }

        this.uploadedFiles = []; // Clear the list of tracked files
    }
}
