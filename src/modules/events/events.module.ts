import { Module } from '@nestjs/common';
import { UserEvents } from './user.events';

@Module({
    controllers: [UserEvents]
})
export class EventsModule {}
