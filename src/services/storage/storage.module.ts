import { Module } from '@nestjs/common';
import { BlobStorageService } from './storage.service';

@Module({
    providers: [BlobStorageService],
    exports: [BlobStorageService]
})
export class BlobStorageModule {}
