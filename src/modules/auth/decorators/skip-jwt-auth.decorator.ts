import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';

export const SkipJwtAuth = () => SetMetadata(appConfig.auth.skipJwtAuthKey, true);
