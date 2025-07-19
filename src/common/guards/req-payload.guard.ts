import * as fs from 'node:fs';
import * as path from 'node:path';
import { BadRequestException, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod/v4';
import { appConfig } from '~/configs';
import { Helper, readError } from '../utils';

// WeakMap to cache metadata for handlers
export const metadataCache = new WeakMap<Function, z.ZodTypeAny>();

export class PayloadGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const uploadedFiles: string[] = [];
        let params = {};

        try {
            const handler = context.getHandler();

            // Attempt to retrieve schema from WeakMap
            let schema: z.ZodTypeAny = metadataCache.get(handler);

            // Fallback to Reflector if schema is not in WeakMap
            if (!schema) {
                schema = this.reflector.get<z.ZodSchema>(appConfig.payloadValidation.decoratorKey, handler);

                // Cache the schema in WeakMap for future use
                if (schema) {
                    metadataCache.set(handler, schema);
                }
            }

            // If no schema is found, skip validation
            if (!schema) return true;

            // Merge request body, params, and query into a single object
            params = { ...request.params, ...request.query, ...request.body };

            // Handle multipart data if applicable
            if (request.isMultipart()) {
                const parts = await request.parts();
                const fileDetails = await this.processMultipart(parts, uploadedFiles);
                params = { ...params, ...fileDetails };
            }

            // Validate the payload using the schema
            const validatedPayload = await schema.parseAsync(params); // Use `parseAsync` for async validation
            request.payload = validatedPayload;
            request.uploadedFiles = uploadedFiles;

            return true;
        } catch (e) {
            // Cleanup uploaded files on error
            await this.cleanupFiles(uploadedFiles);

            let message: string;

            if (e instanceof z.ZodError) {
                // Show only the first error message (field and message)
                const issue = e.issues[0];
                const path = issue && issue.path && issue.path.length > 0 ? issue.path.join('.') : 'unknown';
                message = issue
                    ? (issue.code === 'custom'
                        ? issue.message
                        : `${issue.message} at ${path}`)
                    : 'Payload validation failed';
            } else {
                // Handle non-Zod errors
                message = readError(e) || 'Payload validation failed';
            }

            // Throw the formatted error message
            throw new BadRequestException(message);
        }
    }

    // Process multipart data and return file details
    private async processMultipart(parts: AsyncIterableIterator<any>, uploadedFiles: string[]) {
        const fileWritePromises = [];
        const fileDetails = {};

        for await (const part of parts) {
            if (part.file) {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);

                const uploadDir = path.resolve('uploads');
                await fs.promises.mkdir(uploadDir, { recursive: true });

                const fileName = Helper.File.generateFilename(part.filename);
                const filePath = path.join(uploadDir, fileName);

                // Write file and store its details
                fileWritePromises.push(
                    fs.promises.writeFile(filePath, buffer).then(async () => {
                        const { size: fileBytes } = await fs.promises.stat(filePath);
                        const fileSizeInMB = Helper.File.convertBytes(fileBytes, 'MB');
                        const fileDetail = {
                            mimetype: part.mimetype,
                            filePath,
                            fileSize: fileSizeInMB,
                            fileName,
                            fieldname: part.fieldname,
                            buffer
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
            uploadedFiles.map(filePath =>
                fs.promises.unlink(filePath).catch(() => {
                    // Ignore errors during cleanup
                })
            )
        );
    }
}
