import { Module } from '@nestjs/common';
import { JwtAuthGuard, LocalAuthGuard, RabbitMqModule, StrategyModule } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';

@Module({
    imports: [AuthModule, RabbitMqModule, EventsModule, StrategyModule],
    controllers: [],
    providers: [LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
