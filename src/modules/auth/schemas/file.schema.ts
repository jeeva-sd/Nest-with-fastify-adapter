import * as yup from 'yup';
import { FileTypes, createFileRule } from '~/common';

const fileRule = createFileRule({
    fieldName: 'file',
    allowedMimeTypes: [FileTypes.IMAGE_PNG],
    required: true
});

export const fileSchema = yup.object({
    file: fileRule
});
