import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';

export const SkipResTransform = () => SetMetadata(appConfig.interceptors.response.skipFormatKey, true);
