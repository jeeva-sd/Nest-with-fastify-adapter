import { z } from 'zod/v4';
import { ALL_FILE_TYPES, oneKb } from '~/constants';

export interface FileSchemaOverrides {
    allowedMimeTypes?: string[];
    minFileSize?: number; // Minimum file size in MB
    maxFileSize?: number; // Maximum file size in MB
    required?: boolean;
    fieldName?: string | null;
    includeBuffer?: boolean; // Flag to include buffer in the schema
}

export const createFileRule = (overrides: FileSchemaOverrides = {}) => {
    const {
        allowedMimeTypes = ALL_FILE_TYPES,
        minFileSize = 0.001, // 1 KB
        maxFileSize = 10,
        required = false,
        fieldName = null,
        includeBuffer = false // Default to not including buffer
    } = overrides;

    const withFieldName = (message: string) => (fieldName ? `${fieldName}: ${message}` : message);

    // Define the file schema
    const fileSchema = z.object({
        mimetype: z.string().refine(value => allowedMimeTypes.includes(value), {
            message: withFieldName('The file type is not supported.')
        }),
        fileId: z.string().nullable().default(null),
        fileName: z.string().nonempty(withFieldName('The file name cannot be empty.')),
        filePath: z.string().nonempty(withFieldName('The file path is required.')),
        fileSize: z
            .number()
            .min(minFileSize, {
                message: withFieldName(
                    `The file size must be at least ${minFileSize} MB (${Math.round(minFileSize * oneKb)} KB).`
                )
            })
            .max(maxFileSize, {
                message: withFieldName(
                    `The file size must be less than ${maxFileSize} MB (${Math.round(maxFileSize * oneKb)} KB).`
                )
            })
            .refine(value => !Number.isNaN(value), {
                message: withFieldName('The file size is invalid.')
            }),
        ...(includeBuffer ? { buffer: z.instanceof(Buffer) } : {}) // Include buffer if requested
    });

    // Define the array schema dynamically based on the `required` flag
    const fileArraySchema = required
        ? z.array(fileSchema).min(1, withFieldName('At least one file must be uploaded.'))
        : z.array(fileSchema).optional(); // Make the array optional if not required

    return fileArraySchema;
};
