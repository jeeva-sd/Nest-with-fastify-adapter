import * as fs from 'fs';
import * as path from 'path';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from '~/configs';
import * as yup from 'yup';
import { Exception } from '../filters';
import { Helper, readError } from '../utils';

// WeakMap to cache metadata for handlers
export const metadataCache = new WeakMap<Function, yup.ObjectSchema<any>>();

export class PayloadGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const uploadedFiles: string[] = [];
        let params = {};

        try {
            const handler = context.getHandler();

            // Attempt to retrieve schema from WeakMap
            let schema = metadataCache.get(handler);

            // Fallback to Reflector if schema is not in WeakMap
            if (!schema) {
                schema = this.reflector.get<yup.ObjectSchema<any>>(
                    appConfig.payloadValidation.decoratorKey,
                    handler
                );

                // Cache the schema in WeakMap for future use
                if (schema) {
                    metadataCache.set(handler, schema);
                }
            }

            // If no schema is found, skip validation
            if (!schema) return true;

            // Merge request body, params, and query into a single object
            params = { ...request.body, ...request.params, ...request.query };

            // Handle multipart data if applicable
            if (request.isMultipart()) {
                const parts = await request.parts();
                const fileDetails = await this.processMultipart(parts, uploadedFiles);
                params = { ...params, ...fileDetails };
            }

            // Validate the payload using the schema
            const validatedPayload = await schema.validate(params, appConfig.payloadValidation);
            request.payload = validatedPayload;
            request.uploadedFiles = uploadedFiles;

            return true;
        } catch (e) {
            // Cleanup uploaded files on error
            await this.cleanupFiles(uploadedFiles);
            const message = e?.errors?.[0] || readError(e) || 'Payload validation failed';
            throw new Exception(1003, message);
        }
    }

    // Process multipart data and return file details
    private async processMultipart(parts: AsyncIterableIterator<any>, uploadedFiles: string[]) {
        const fileWritePromises = [];
        const fileDetails = {};

        for await (const part of parts) {
            if (part.file) {
                const uploadDir = path.resolve('uploads');
                await fs.promises.mkdir(uploadDir, { recursive: true });

                const fileName = Helper.File.generateFilename(part.filename);
                const filePath = path.join(uploadDir, fileName);

                // Write file and store its details
                fileWritePromises.push(
                    fs.promises.writeFile(filePath, part.file).then(async () => {
                        const { size: fileBytes } = await fs.promises.stat(filePath);
                        const fileSizeInMB = Helper.File.convertBytes(fileBytes, 'MB');
                        const fileDetail = {
                            mimetype: part.mimetype,
                            filePath,
                            fileSize: fileSizeInMB,
                            fileName,
                            fieldname: part.fieldname,
                        };

                        // Add file details to the corresponding field
                        if (!fileDetails[part.fieldname]) {
                            fileDetails[part.fieldname] = [];
                        }
                        fileDetails[part.fieldname].push(fileDetail);

                        uploadedFiles.push(filePath);
                    })
                );
            } else {
                // Add non-file fields to params
                fileDetails[part.fieldname] = part.value;
            }
        }

        // Wait for all file writes to complete
        await Promise.all(fileWritePromises);
        return fileDetails;
    }

    // Cleanup files concurrently using Promise.all
    private async cleanupFiles(uploadedFiles: string[]) {
        await Promise.all(
            uploadedFiles.map((filePath) =>
                fs.promises.unlink(filePath).catch(() => {
                    // Ignore errors during cleanup
                })
            )
        );
    }
}
