import * as yup from 'yup';

export const userCreatedMessage = yup.object().shape({
    userId: yup.number().required(),
    points: yup.number().required().min(10),
});

export type UserCreatedMessage = yup.InferType<typeof userCreatedMessage>;
