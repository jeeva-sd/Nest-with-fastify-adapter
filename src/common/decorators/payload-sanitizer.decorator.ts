import { SetMetadata } from '@nestjs/common';
import { ZodType, z } from 'zod';
import { appConfig } from '~/configs';
import { metadataCache } from '../guards/req-payload.guard'; // WeakMap

export const Sanitize = (schema: ZodType<unknown>) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Register the schema in the WeakMap using the handler function as the key
        metadataCache.set(descriptor.value, schema);

        // Apply NestJS metadata for fallback (optional)
        SetMetadata(appConfig.payloadValidation.decoratorKey, schema)(target, propertyKey, descriptor);
    };
};
