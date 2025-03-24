import { Module } from '@nestjs/common';
import { JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';
import { AuthModule } from './modules/auth/auth.module';
import { RabbitMqModule } from './modules/rabbit-mq/rabbit-mq.module';
import { EventsModule } from './modules/events/events.module';

@Module({
    imports: [AuthModule, RabbitMqModule, EventsModule],
    controllers: [],
    providers: [JwtStrategy, LocalStrategy, LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
