import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs/envs/envs.reader';

export const SkipJwtAuth = () => SetMetadata(appConfig.auth.skipJwtAuthKey, true);
