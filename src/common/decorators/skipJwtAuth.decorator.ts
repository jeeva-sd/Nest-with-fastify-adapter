import { SetMetadata } from '@nestjs/common';
import { appConfig } from 'src/configs';

export const SkipJwtAuth = () => SetMetadata(appConfig.auth.skipJwtAuthKey, true);
