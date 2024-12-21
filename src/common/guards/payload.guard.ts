import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as path from 'path';
import * as fs from 'fs';
import * as yup from 'yup';
import { appConfig } from 'src/configs';
import { Helper, readError } from '../utils';
import { Exception } from '../filters';

export class PayloadGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const uploadedFiles: string[] = [];
        let params = {};

        try {
            const schema = this.reflector.get<yup.ObjectSchema<any>>(
                appConfig.payloadValidation.decoratorKey,
                context.getHandler()
            );
            if (!schema) return true;

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
                            const uploadDir = path.resolve('uploads');
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

                            uploadedFiles.push(filePath);
                        }
                    } else {
                        params[part.fieldname] = part.value;
                    }
                }
            }

            const validatedPayload = await schema.validate(params, appConfig.payloadValidation);
            request.payload = validatedPayload;
            request.uploadedFiles = uploadedFiles;

            return true;
        } catch (e) {
            await this.cleanupFiles(uploadedFiles);

            const message = e?.errors?.length ? e.errors[0] : (readError(e) ?? 'Payload validation failed');
            throw new Exception(1003, message);
        }
    }

    private async cleanupFiles(uploadedFiles: string[]) {
        for (const filePath of uploadedFiles) {
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error(`Failed to delete file ${filePath}: ${err.message}`);
            }
        }
    }
}
