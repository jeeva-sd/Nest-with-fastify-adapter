import * as fs from 'fs';
import { RequestX } from "../types";

export const fileCleaner = async (request) => {
    const uploadedFiles = (request as RequestX).uploadedFiles || [];

    if (uploadedFiles.length > 0) {
        try {
            // Delete files in parallel
            await Promise.all(
                uploadedFiles.map(async (filePath) => {
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        console.error(`Failed to delete file ${filePath}: ${err.message}`);
                    }
                })
            );
        } catch (cleanupError) {
        }
    }
};
