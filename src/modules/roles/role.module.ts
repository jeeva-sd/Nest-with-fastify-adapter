import { Module } from '@nestjs/common';
import { RolesController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    controllers: [RolesController],
    providers: [RoleService],
    exports: [RoleService]
})
export class RoleModule {}
