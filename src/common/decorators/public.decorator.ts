import { SetMetadata } from '@nestjs/common';
import { appConfig } from 'src/configs';

export const Public = () => SetMetadata(appConfig.auth.publicKey, true);
