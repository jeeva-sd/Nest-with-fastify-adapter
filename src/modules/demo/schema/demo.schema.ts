import * as z from 'zod';
import { FileTypes, createFileRule } from '~/common';

const fileRule = createFileRule({
    fieldName: 'file',
    allowedMimeTypes: [FileTypes.IMAGE_PNG],
    maxFileSize: 3,
    required: true
});

export const fileSchema = z.object({
    file: fileRule
});

export const nameSchema = z.object({
    name: z.coerce.string({ message: 'Name should be string' }).nonempty({ message: 'Name is required' }),
    file: fileRule,
    required: z
        .union([z.boolean(), z.enum(['true', 'false'])]) // Accepts true/false or 'true'/'false'
        .refine(value => typeof value === 'boolean' || value === 'true' || value === 'false', {
            message: 'Required must be a boolean or "true"/"false"'
        })
        .transform(value => value === true || value === 'true') // Normalize to boolean
});
