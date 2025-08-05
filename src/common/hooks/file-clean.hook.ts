import * as fs from 'node:fs';
import { RequestX } from '../types';
import { appConfig } from '~/configs';

export const fileCleaner = async (request: RequestX) => {
    const uploadedFiles = request.uploadedFiles || [];

    if (request.skipFileCleanup) {
        appConfig.server.mode === 'development' && console.warn('File cleanup skipped due to skipFileCleanup flag');
        return;
    }

    if (uploadedFiles.length > 0) {
        try {
            // Filter files based on skipFileCleanupFields
            const filesToDelete = uploadedFiles.filter(file => {
                // If no specific fields to skip, delete all files
                if (!request.skipFileCleanupFields || request.skipFileCleanupFields.length === 0) {
                    return true;
                }

                // Only delete files whose fieldname is NOT in the skip list
                return !request.skipFileCleanupFields.includes(file.fieldname);
            });

            if (appConfig.server.mode === 'development' && request.skipFileCleanupFields?.length > 0) {
                const skippedCount = uploadedFiles.length - filesToDelete.length;
                console.log(`File cleanup: ${filesToDelete.length} files will be deleted, ${skippedCount} files skipped for fields: [${request.skipFileCleanupFields.join(', ')}]`);
            }

            // Delete filtered files in parallel
            await Promise.all(
                filesToDelete.map(async file => {
                    try {
                        await fs.promises.unlink(file.filePath);
                    } catch (err) {
                        console.error(`Failed to delete file ${file.filePath}: ${err.message}`);
                    }
                })
            );
        } catch (_cleanupError) {}
    }
};
