import * as yup from 'yup';

export const xAccessToken = yup.object({
    xAccessToken: yup.string().required('Token is required')
});

export type XAccessTokenType = yup.InferType<typeof xAccessToken>;
