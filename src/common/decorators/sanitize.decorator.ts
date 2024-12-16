import { SetMetadata } from '@nestjs/common';
import * as yup from 'yup';

export const Sanitize = (schema: yup.ObjectSchema<any>) => SetMetadata('schema', schema);
