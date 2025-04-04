import { FileTypes, createFileRule } from 'src/common';
import * as yup from 'yup';

const fileRule = createFileRule({
    fieldName: 'file',
    allowedMimeTypes: [FileTypes.IMAGE_PNG],
    required: true
});

export const fileSchema = yup.object({
    file: fileRule
});
