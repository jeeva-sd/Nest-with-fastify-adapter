import { randomUUID } from "node:crypto";
import * as fs from 'fs';
import * as path from 'path';
import { Helper } from "./helpers";

export class FileUtils {
    static File = class {
        /**
         * Generates a unique and slugified filename with timestamp and UUID.
         * Useful for saving files without collisions.
         */
        static generateFilename(originalFilename: string): string {
            const uuid = randomUUID();
            const extension = originalFilename.split('.').pop();
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').replace(/\..+/, '');

            return `${Helper.String.slugify(originalFilename)}-${timestamp}-${uuid}.${extension}`;
        }

        /**
         * Reads the content of a file at the given path and returns it as a Buffer.
         * Throws an error if the file doesn't exist or cannot be read.
         */
        static async readFile(filePath: string): Promise<Buffer> {
            try {
                // Check if the file exists
                await fs.promises.access(filePath, fs.constants.F_OK);

                // Read the file
                const data = await fs.promises.readFile(filePath);
                return data; // Return the content as a Buffer
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.error(`File does not exist at ${filePath}`);
                } else {
                    console.error(`Failed to read file at ${filePath}: ${error.message}`);
                }
                throw error;
            }
        }

        /**
         * Converts a byte value into a human-readable format (KB, MB, GB).
         * Defaults to KB and 2 decimal places.
         */
        static convertBytes(bytes: number, unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB', decimals = 2) {
            if (bytes === 0) return '0 Bytes';

            const units = {
                B: 1,
                KB: 1024,
                MB: 1024 * 1024,
                GB: 1024 * 1024 * 1024
            };

            const value = bytes / units[unit];
            return Number(value.toFixed(decimals));
        }

        /**
         * Deletes a file from the file system.
         */
        static async deleteFile(filePath: string): Promise<void> {
            try {
                await fs.promises.unlink(filePath);
            } catch (error) {
                console.error(`Error deleting file at ${filePath}: ${error.message}`);
                throw error;
            }
        }

        /**
         * Checks if a file exists at the given path.
         */
        static async fileExists(filePath: string): Promise<boolean> {
            try {
                await fs.promises.access(filePath, fs.constants.F_OK);
                return true;
            } catch {
                return false;
            }
        }

        /**
         * Returns the extension of a file (e.g., .txt, .jpg).
         */
        static getExtension(fileName: string): string {
            return path.extname(fileName);
        }

        /**
         * Returns the file name without its extension.
         */
        static getBaseName(fileName: string): string {
            return path.basename(fileName, path.extname(fileName));
        }

        /**
         * Writes data to a file at a specified path.
         * Creates the file if it doesn't exist or overwrites it.
         */
        static async writeFile(filePath: string, data: string | Buffer): Promise<void> {
            try {
                await fs.promises.writeFile(filePath, data);
            } catch (error) {
                console.error(`Error writing to file at ${filePath}: ${error.message}`);
                throw error;
            }
        }

        /**
         * Gets the size of the file in bytes.
         */
        static async getFileSize(filePath: string): Promise<number> {
            try {
                const stats = await fs.promises.stat(filePath);
                return stats.size;
            } catch (error) {
                console.error(`Error getting size of file at ${filePath}: ${error.message}`);
                throw error;
            }
        }

        /**
         * Renames or moves a file from oldPath to newPath.
         */
        static async renameFile(oldPath: string, newPath: string): Promise<void> {
            try {
                await fs.promises.rename(oldPath, newPath);
            } catch (error) {
                console.error(`Error renaming file from ${oldPath} to ${newPath}: ${error.message}`);
                throw error;
            }
        }
    };
}
