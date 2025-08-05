import { Module } from '@nestjs/common';
import { DatabaseModule } from '~/modules/database';
import { RolesController } from './roles.controller';
import { RoleService } from './roles.service';

@Module({
    imports: [DatabaseModule],
    controllers: [RolesController],
    providers: [RoleService],
    exports: [RoleService]
})
export class RoleModule {}
