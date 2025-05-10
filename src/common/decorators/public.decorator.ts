import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';

export const Public = () => SetMetadata(appConfig.auth.publicAuthKey, true);
