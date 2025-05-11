import * as fs from 'fs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Interceptor to clean up uploaded files after request processing
@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
    private readonly logger = new Logger(FileCleanupInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap({
                complete: () => this.cleanupFiles(context),
                error: () => this.cleanupFiles(context),
            })
        );
    }

    // Cleanup uploaded files
    private async cleanupFiles(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (!request) return; // Ensure request is defined

        const uploadedFiles = request?.uploadedFiles || [];
        if (!uploadedFiles?.length) return; // Skip if no files to clean up

        // Delete files in parallel
        await Promise.all(
            uploadedFiles.map(async (filePath) => {
                try {
                    await fs.promises.unlink(filePath);
                } catch (err) {
                    this.logger.error(`Failed to delete file ${filePath}: ${err.message}`);
                }
            })
        );

        // Clear the uploadedFiles array
        request.uploadedFiles = [];
    }
}
