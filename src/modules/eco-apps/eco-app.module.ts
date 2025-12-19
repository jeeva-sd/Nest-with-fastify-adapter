import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { RoleModule } from '../roles/role.module';
import { EcoAppsController } from './eco-app.controller';
import { EcoAppsService } from './eco-app.service';
import { DepartmentSyncEvent } from './events/department-sync.event';

@Module({
    imports: [RoleModule, EventsModule],
    controllers: [EcoAppsController, DepartmentSyncEvent],
    providers: [EcoAppsService],
    exports: [EcoAppsService]
})
export class EcoAppsModule {}
