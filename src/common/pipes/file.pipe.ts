import * as yup from 'yup';
import { ALL_FILE_TYPES, oneKb } from '../../constants';

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
        fieldName = null
    } = overrides;

    const withFieldName = (message: string) => (fieldName ? `${fieldName}: ${message}` : message);

    const fileSchema = yup.object().shape({
        mimetype: yup
            .string()
            .oneOf(allowedMimeTypes, withFieldName('Invalid file mimetype'))
            .required(withFieldName('File type is required')),
        fileName: yup.string().required(withFieldName('Invalid file name')),
        filePath: yup.string().required(withFieldName('File path is required')),
        fileSize: yup
            .number()
            .min(minFileSize, withFieldName(`File size must be at least ${minFileSize} MB (${minFileSize * oneKb} KB)`))
            .max(
                maxFileSize,
                withFieldName(`File size must be less than ${maxFileSize} MB (${maxFileSize * oneKb} KB)`)
            )
            .typeError(withFieldName('Invalid file parameters'))
            .required(withFieldName('Invalid file size'))
    });

    return yup
        .array()
        .of(fileSchema)
        .typeError(withFieldName('Invalid file parameters'))
        .when([], {
            is: () => required,
            then: schema => schema.required(withFieldName('File attachment is required'))
        });
};
