import { SetMetadata } from '@nestjs/common';
import { appConfig } from '~/configs';

export const Roles = (...roles: string[]) => SetMetadata(appConfig.auth.roleKey, roles);
