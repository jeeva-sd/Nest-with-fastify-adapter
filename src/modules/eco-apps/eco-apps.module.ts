import { Module } from '@nestjs/common';
import { RoleModule } from '../roles/role.module';
import { EcoAppsController } from './eco-apps.controller';
import { EcoAppsService } from './eco-apps.service';

@Module({
    imports: [RoleModule],
    controllers: [EcoAppsController],
    providers: [EcoAppsService],
    exports: [EcoAppsService]
})
export class EcoAppsModule {}
