import { BlobServiceClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';
import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '~/configs';

@Injectable()
export class BlobStorageService {
    private readonly logger = new Logger(BlobStorageService.name);
    private containerClient: ContainerClient;

    constructor() {
        const blobServiceClient = BlobServiceClient.fromConnectionString(appConfig.blobStorage.connection);
        this.containerClient = blobServiceClient.getContainerClient(appConfig.blobStorage.container);
    }

    async upload(buffer: Buffer, fileName: string, mimetype = 'application/octet-stream'): Promise<string> {
        const blockBlobClient = this.containerClient.getBlockBlobClient(`${appConfig.blobStorage.assets}/${fileName}`);
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: mimetype
            }
        });

        this.logger.log(`Uploaded blob: ${fileName}`);
        return blockBlobClient.url;
    }

    async delete(blobPath: string): Promise<void> {
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
        await blockBlobClient.deleteIfExists();
        this.logger.log(`Deleted blob: ${blobPath}`);
    }

    async url(fileName: string): Promise<string> {
        return this.containerClient.getBlockBlobClient(`${appConfig.blobStorage.assets}/${fileName}`).url;
    }

    async buffer(blobPath: string): Promise<{ buffer: Buffer | null; contentType: string | null }> {
        const blockBlobClient: BlockBlobClient = this.containerClient.getBlockBlobClient(
            `${appConfig.blobStorage.assets}/${blobPath}`
        );
        const exists = await blockBlobClient.exists();

        if (!exists) {
            this.logger.warn(`Blob with path ${blobPath} not found.`);
            return { buffer: null, contentType: null };
        }

        const properties = await blockBlobClient.getProperties();
        const contentType = properties.contentType || 'application/octet-stream'; // Default to binary if no content type is found

        const buffer = await blockBlobClient.downloadToBuffer();
        return { buffer, contentType };
    }
}
