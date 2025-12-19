import { Module } from '@nestjs/common';
import { JobsModule } from '~/services';
import { AppEvents } from './event.emitter';

@Module({
    imports: [JobsModule],
    providers: [AppEvents],
    exports: [AppEvents]
})
export class EventsModule {}
