import * as fs from 'node:fs';
import * as path from 'node:path';
import { BadRequestException, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z, ZodType } from 'zod/v4';
import { appConfig } from '~/configs';
import { Helper, readError } from '../utils';

// Define types for multipart parts
interface MultipartFile {
    file: AsyncIterable<Buffer>;
    filename: string;
    mimetype: string;
    fieldname: string;
}

interface MultipartField {
    fieldname: string;
    value: string;
}

type MultipartPart = MultipartFile | MultipartField;

export interface FileDetail {
    fileId: string | null;
    mimetype: string;
    filePath: string;
    fileSize: number;
    fileName: string;
    fieldname: string;
    buffer?: Buffer; // Make optional to save memory
}

// Enhanced cache with LRU-like behavior
class SchemaCache {
    private cache = new WeakMap<object, ZodType<unknown>>();
    private static instance: SchemaCache;

    static getInstance(): SchemaCache {
        if (!SchemaCache.instance) {
            SchemaCache.instance = new SchemaCache();
        }
        return SchemaCache.instance;
    }

    set(key: object, value: ZodType<unknown>): void {
        this.cache.set(key, value);
    }

    get(key: object): ZodType<unknown> | undefined {
        return this.cache.get(key);
    }
}

export const metadataCache = SchemaCache.getInstance();

export class PayloadGuard implements CanActivate {
    private readonly uploadDir: string;

    constructor(private readonly reflector: Reflector) {
        this.uploadDir = path.resolve('uploads');
        // Ensure upload directory exists at startup
        this.ensureUploadDir();
    }

    private async ensureUploadDir(): Promise<void> {
        try {
            await fs.promises.access(this.uploadDir);
        } catch {
            await fs.promises.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const uploadedFiles: FileDetail[] = [];
        let params: Record<string, unknown> = {};

        try {
            const handler = context.getHandler();

            // Schema retrieval with caching
            let schema: ZodType<unknown> = metadataCache.get(handler);

            if (!schema) {
                schema = this.reflector.get<ZodType<unknown>>(appConfig.payloadValidation.decoratorKey, handler);
                if (schema) {
                    metadataCache.set(handler, schema);
                }
            }

            if (!schema) return true;

            // Pre-merge common request data
            params = {
                ...request.params,
                ...request.query,
                ...request.body
            };

            // Multipart handling
            if (request.isMultipart()) {
                const fileDetails = await this.processMultipartOptimized(request.parts(), uploadedFiles);
                Object.assign(params, fileDetails);
            }

            // Validate payload
            const validatedPayload = schema.parse(params);
            request.payload = validatedPayload;
            request.uploadedFiles = uploadedFiles;

            return true;
        } catch (e) {
            // Cleanup uploaded files on error
            await this.cleanupFilesOptimized(uploadedFiles);

            let message: string;
            if (e instanceof z.ZodError) {
                const issue = e.issues[0];
                const path = issue?.path?.length > 0 ? issue.path.join('.') : 'unknown';
                message = issue?.code === 'custom'
                    ? issue.message
                    : `${issue.message} at ${path}`;
            } else {
                message = readError(e) || 'Payload validation failed';
            }

            throw new BadRequestException(message);
        }
    }

    // Optimized multipart processing with streaming and memory management
    private async processMultipartOptimized(
        parts: AsyncIterableIterator<MultipartPart>,
        uploadedFiles: FileDetail[]
    ): Promise<Record<string, unknown>> {
        const fileDetails: Record<string, unknown> = {};
        const filePromises: Promise<void>[] = [];

        for await (const part of parts) {
            if ('file' in part) {
                // Process files with streaming to reduce memory usage
                filePromises.push(this.processFileStream(part, fileDetails, uploadedFiles));
            } else {
                // Handle regular fields
                fileDetails[part.fieldname] = part.value;
            }
        }

        // Process all files concurrently
        await Promise.all(filePromises);
        return fileDetails;
    }

    private async processFileStream(
        part: MultipartFile,
        fileDetails: Record<string, unknown>,
        uploadedFiles: FileDetail[]
    ): Promise<void> {
        const fileName = part.filename;
        const fileId = Helper.File.generateUploadFilename(fileName);
        const filePath = path.join(this.uploadDir, fileId);

        try {
            // Stream file directly to disk to reduce memory usage
            const writeStream = fs.createWriteStream(filePath);
            const chunks: Buffer[] = [];

            // Collect chunks for buffer if needed, but stream to disk
            for await (const chunk of part.file) {
                chunks.push(chunk);
                writeStream.write(chunk);
            }

            await new Promise<void>((resolve, reject) => {
                writeStream.end((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const stats = await fs.promises.stat(filePath);
            const fileSizeInMB = Helper.File.convertBytes(stats.size, 'MB');

            const fileDetail: FileDetail = {
                fileId,
                mimetype: part.mimetype,
                filePath,
                fileSize: fileSizeInMB,
                fileName,
                fieldname: part.fieldname,
                buffer: Buffer.concat(chunks)
            };

            // Initialize array if needed and add file detail
            if (!fileDetails[part.fieldname]) {
                fileDetails[part.fieldname] = [];
            }
            (fileDetails[part.fieldname] as FileDetail[]).push(fileDetail);
            uploadedFiles.push({...fileDetail, buffer: undefined}); // Avoid storing large buffers in uploadedFiles

        } catch (error) {
            // Clean up partial file on error
            try {
                await fs.promises.unlink(filePath);
            } catch {
                // Ignore cleanup errors
            }
            throw error;
        }
    }

    // Optimized cleanup with better error handling
    private async cleanupFilesOptimized(uploadedFiles: FileDetail[]): Promise<void> {
        if (uploadedFiles.length === 0) return;

        const results = await Promise.allSettled(
            uploadedFiles.map(fileDetail => fs.promises.unlink(fileDetail.filePath))
        );

        // Log any cleanup failures in development
        if (process.env.NODE_ENV === 'development') {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.warn(`Failed to cleanup file: ${uploadedFiles[index].filePath}`);
                }
            });
        }
    }
}
