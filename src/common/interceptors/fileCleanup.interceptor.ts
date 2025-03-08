import * as fs from 'fs';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Clear the uploaded files list after request completes
@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap({
                complete: () => this.cleanupFiles(context),
                error: () => this.cleanupFiles(context)
            })
        );
    }

    private async cleanupFiles(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const uploadedFiles = request?.uploadedFiles || [];
        if (!uploadedFiles?.length) return;

        for (const filePath of uploadedFiles) {
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error(`Failed to delete file ${filePath}: ${err.message}`);
            }
        }

        request.uploadedFiles = [];
    }
}
