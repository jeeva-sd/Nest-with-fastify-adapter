import { Module } from '@nestjs/common';
import { JobsModule } from '~/services';
import { Events } from './event.emitter';

@Module({
    imports: [JobsModule],
    providers: [Events],
    exports: [Events]
})
export class EventsModule {}
