import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs/config.reader';

export const Public = () => SetMetadata(appConfig.auth.publicAuthKey, true);
