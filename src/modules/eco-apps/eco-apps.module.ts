import { Module } from '@nestjs/common';
import { RoleModule } from '../roles/role.module';
import { PermissionCacheService } from '../roles/permission-cache.service';
import { EcoAppsController } from './eco-apps.controller';
import { EcoAppsService } from './eco-apps.service';

@Module({
    imports: [RoleModule],
    controllers: [EcoAppsController],
    providers: [EcoAppsService, PermissionCacheService],
    exports: [EcoAppsService]
})
export class EcoAppsModule {}
