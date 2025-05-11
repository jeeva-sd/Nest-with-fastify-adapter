import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';
import * as z from 'zod';
import { metadataCache } from '../guards/req-payload.guard'; // Import the WeakMap

export const Sanitize = (schema: z.ZodTypeAny) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Register the schema in the WeakMap using the handler function as the key
        metadataCache.set(descriptor.value, schema);

        // Apply NestJS metadata for fallback (optional)
        SetMetadata(appConfig.payloadValidation.decoratorKey, schema)(
            target,
            propertyKey,
            descriptor
        );
    };
};
