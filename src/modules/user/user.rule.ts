import { IMAGE_FILE_TYPES } from 'src/constants';
import { createFileRule } from 'src/utils';
import * as yup from 'yup';

const profileImageRule = createFileRule({
    maxFileSize: 3,
    allowedMimeTypes: IMAGE_FILE_TYPES,
});

export const newUserRule = yup.object().shape({
    id: yup.string().required('ID is required'),
    profileOne: profileImageRule,
    profileTwo: profileImageRule,
});

export type NewUserPayload = yup.InferType<typeof newUserRule>;
