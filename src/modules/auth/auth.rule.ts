import * as yup from 'yup';

export const loginRule = yup.object().shape({
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be less than or equal to 20 characters long'),
    password: yup
        .string()
        .required('Password is required')
        .min(4, 'Password must be at least 6 characters long')
        .max(50, 'Password must be less than or equal to 50 characters long'),
});

export type LoginPayload = yup.InferType<typeof loginRule>;
