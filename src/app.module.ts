import { Module } from '@nestjs/common';
import { JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';
import { AuthModule } from './modules/auth/auth.module';
import { RabbitMqModule } from './modules/rabbit-mq/rabbit-mq.module';

@Module({
    imports: [AuthModule, RabbitMqModule],
    controllers: [],
    providers: [JwtStrategy, LocalStrategy, LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
