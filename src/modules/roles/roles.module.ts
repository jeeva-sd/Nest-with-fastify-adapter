import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';

@Module({
    controllers: [],
    providers: [RoleService],
    exports: [RoleService]
})
export class RoleModule {}
