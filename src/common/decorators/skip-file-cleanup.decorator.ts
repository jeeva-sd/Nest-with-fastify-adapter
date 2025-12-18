import { SetMetadata } from '@nestjs/common';
import { RequestX } from '../types';

// biome-ignore lint/security/noSecrets: key for metadata, not a secret
const SKIP_FILE_CLEANUP_KEY = 'skipFileCleanup';

/**
 * Decorator to skip file cleanup for specific field names
 * @param fieldNames - Array of field names whose files should not be deleted
 *
 * @example
 * ```typescript
 * @SkipFileCleanup(['profileImage', 'documents'])
 * async uploadFiles(@Req() request: RequestX, @Sanitize(FileUploadDto) payload: FileUploadDto) {
 *   // Files from 'profileImage' and 'documents' fields won't be deleted
 * }
 * ```
 */
export const SkipFileCleanup = (fieldNames: string[]) => {
    return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            // In NestJS controllers, the request object is typically injected via @Req() decorator
            // We need to find it in the arguments and modify it before the method executes
            for (const arg of args) {
                if (arg && typeof arg === 'object' && 'url' in arg && 'method' in arg && 'headers' in arg) {
                    // This looks like a request object
                    (arg as RequestX).skipFileCleanupFields = fieldNames;
                }
            }

            return originalMethod.apply(this, args);
        };

        // Set metadata for potential future use
        SetMetadata(SKIP_FILE_CLEANUP_KEY, fieldNames)(target, propertyKey, descriptor);

        return descriptor;
    };
};
