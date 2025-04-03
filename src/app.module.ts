import { Module } from '@nestjs/common';
import { JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { RabbitMqModule } from './modules/rabbit-mq/rabbit-mq.module';

@Module({
    imports: [AuthModule, RabbitMqModule, EventsModule],
    controllers: [],
    providers: [JwtStrategy, LocalStrategy, LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
