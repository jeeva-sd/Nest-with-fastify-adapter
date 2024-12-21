import { applyDecorators, SetMetadata } from '@nestjs/common';
import { appConfig } from 'src/configs';
import * as yup from 'yup';

export const Sanitize = (schema: yup.ObjectSchema<any>) => {
    return applyDecorators(SetMetadata(appConfig.payloadValidation.decoratorKey, schema));
};
