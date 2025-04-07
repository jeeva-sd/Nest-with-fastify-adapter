import * as yup from 'yup';

export const nameSchema = yup.object({
    name: yup.string().required()
});
