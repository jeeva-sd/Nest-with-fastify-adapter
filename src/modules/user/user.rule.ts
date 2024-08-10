import * as yup from 'yup';

export const newUserRule = yup.object().shape({
    id: yup.string().required('ID is required'),
    profileOne: yup.mixed().required('profileOne is required'),
    profileTwo: yup.mixed().required('profileTwo is required'),
});

export type NewUserPayload = yup.InferType<typeof newUserRule>;
