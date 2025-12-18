import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs/config.reader';

export const SkipJwtAuth = () => SetMetadata(appConfig.auth.skipJwtAuthKey, true);
