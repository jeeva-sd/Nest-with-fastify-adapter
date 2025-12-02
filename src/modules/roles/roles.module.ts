import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RoleService } from './roles.service';

@Module({
    controllers: [RolesController],
    providers: [RoleService],
    exports: [RoleService]
})
export class RoleModule {}
