import * as Yup from 'yup';

export const nameSchema = Yup.object({
    name: Yup.string().required('Name is required')
});
