import { Module } from '@nestjs/common';
import { RolesController } from './role.controller';
import { RoleService } from './role.service';
import { PermissionCacheService } from './permission-cache.service';
import { RoleGuard } from './guards/role.guard';

@Module({
    controllers: [RolesController],
    providers: [RoleService, PermissionCacheService, RoleGuard],
    exports: [RoleService, RoleGuard]
})
export class RoleModule {}
