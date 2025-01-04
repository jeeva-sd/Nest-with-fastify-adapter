import * as yup from 'yup';
import { createFileRule, FileTypes } from 'src/common';

const fileRule = createFileRule({
    fieldName: 'file',
    allowedMimeTypes: [FileTypes.IMAGE_PNG],
    required: true
});

export const fileSchema = yup.object({
    file: fileRule
});
