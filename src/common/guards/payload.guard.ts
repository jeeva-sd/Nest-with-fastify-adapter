import * as fs from 'fs';
import * as path from 'path';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from '~/configs';
import * as yup from 'yup';
import { Exception } from '../filters';
import { Helper, readError } from '../utils';

export class PayloadGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

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
                const fileWritePromises = []; // Array to store promises for file writes

                for await (const part of parts) {
                    if (part.file) {
                        const uploadDir = path.resolve('uploads');
                        await fs.promises.mkdir(uploadDir, { recursive: true });

                        const files = Array.isArray(part.file) ? part.file : [part.file];
                        for (const file of files) {
                            const fileName = Helper.File.generateFilename(part.filename);
                            const filePath = path.join(uploadDir, fileName);

                            // Push the file write promise to the array
                            fileWritePromises.push(
                                fs.promises.writeFile(filePath, file).then(async () => {
                                    const { size: fileBytes } = await fs.promises.stat(filePath);
                                    const fileSizeInMB = Helper.File.convertBytes(fileBytes, 'MB');
                                    return {
                                        mimetype: part.mimetype,
                                        filePath,
                                        fileSize: fileSizeInMB,
                                        fileName,
                                        fieldname: part.fieldname,
                                    };
                                })
                            );
                            uploadedFiles.push(filePath);
                        }
                    } else {
                        params[part.fieldname] = part.value;
                    }
                }

                // Wait for all file writes to complete
                const fileDetails = await Promise.all(fileWritePromises);

                // Process file details and add them to params
                fileDetails.forEach(detail => {
                    if (!params[detail.fieldname]) {
                        params[detail.fieldname] = [];
                    }
                    params[detail.fieldname].push({
                        mimetype: detail.mimetype,
                        filePath: detail.filePath,
                        fileSize: detail.fileSize,
                        fileName: detail.fileName
                    });
                });
            }

            const validatedPayload = await schema.validate(params, appConfig.payloadValidation);
            request.payload = validatedPayload;
            request.uploadedFiles = uploadedFiles;

            return true;
        } catch (e) {
            await this.cleanupFiles(uploadedFiles);
            const message =
                e?.errors?.length ? e.errors[0] : (readError(e) ?? 'Payload validation failed');
            throw new Exception(1003, message);
        }
    }

    // Cleanup files concurrently using Promise.all
    private async cleanupFiles(uploadedFiles: string[]) {
        await Promise.all(
            uploadedFiles.map((filePath) =>
                fs.promises.unlink(filePath).catch(() => { })
            )
        );
    }
}
