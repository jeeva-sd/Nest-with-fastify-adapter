import * as yup from 'yup';

export const getUserRule = yup.object().shape({
    id: yup.string().required('ID is required'),
});

export type GetUserPayload = yup.InferType<typeof getUserRule>;
