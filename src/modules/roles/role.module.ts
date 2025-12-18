import { Module } from '@nestjs/common';
import { RoleGuard } from './guards/role.guard';
import { PermissionCacheService } from './permission-cache.service';
import { RolesController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    controllers: [RolesController],
    providers: [RoleService, PermissionCacheService, RoleGuard],
    exports: [RoleService, RoleGuard, PermissionCacheService]
})
export class RoleModule {}
