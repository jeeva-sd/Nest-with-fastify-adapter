import { z } from 'zod';
import { ALL_FILE_TYPES, oneKb } from '~/constants';

export interface FileSchemaOverrides {
    allowedMimeTypes?: string[];
    minFileSize?: number; // Minimum file size in MB
    maxFileSize?: number; // Maximum file size in MB
    required?: boolean;
    fieldName?: string | null;
}

export const createFileRule = (overrides: FileSchemaOverrides = {}) => {
    const {
        allowedMimeTypes = ALL_FILE_TYPES,
        minFileSize = 0.001, // 1 KB
        maxFileSize = 10,
        required = false,
        fieldName = null,
    } = overrides;

    const withFieldName = (message: string) => (fieldName ? `${fieldName}: ${message}` : message);

    // Define the file schema
    const fileSchema = z.object({
        mimetype: z
            .string()
            .refine((value) => allowedMimeTypes.includes(value), {
                message: withFieldName('Invalid file mimetype'),
            }),
        fileName: z.string().nonempty(withFieldName('Invalid file name')),
        filePath: z.string().nonempty(withFieldName('File path is required')),
        fileSize: z
            .number()
            .min(minFileSize, {
                message: withFieldName(`File size must be at least ${minFileSize} MB (${minFileSize * oneKb} KB)`),
            })
            .max(maxFileSize, {
                message: withFieldName(`File size must be less than ${maxFileSize} MB (${maxFileSize * oneKb} KB)`),
            })
            .refine((value) => !isNaN(value), {
                message: withFieldName('Invalid file parameters'),
            }),
    });

    // Define the array schema
    let fileArraySchema: any = z.array(fileSchema, {
        invalid_type_error: withFieldName('Invalid file parameters'),
    });

    // Conditionally apply the `superRefine` logic only if `required` is true
    if (required) {
        fileArraySchema = fileArraySchema.superRefine((files, ctx) => {
            if (files.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: withFieldName('File attachment is required'),
                });
            }
        });
    } else {
        // If not required, make the array optional
        fileArraySchema = fileArraySchema.optional();
    }

    // Return the schema without casting to ZodArray
    return fileArraySchema;
};
