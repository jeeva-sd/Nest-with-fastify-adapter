import { SetMetadata } from '@nestjs/common';
import { appConfig } from 'src/configs';

export const Roles = (...roles: string[]) => SetMetadata(appConfig.auth.roleKey, roles);
