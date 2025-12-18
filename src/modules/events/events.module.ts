import { Module } from '@nestjs/common';
import { JobsModule } from '~/services';
import { RoleModule } from '../roles/roles.module';
import { EcoAppsEvents } from './eco-apps.events';
import { Events } from './event.emitter';

@Module({
    imports: [RoleModule, JobsModule],
    controllers: [EcoAppsEvents],
    providers: [Events],
    exports: [Events]
})
export class EventsModule {}
