import { Module } from '@nestjs/common';
import { RoleModule } from '../roles/roles.module';
import { EcoAppsEvents } from './eco-apps.events';

@Module({
    imports: [RoleModule],
    controllers: [EcoAppsEvents]
})
export class EventsModule {}
