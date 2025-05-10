import { Module } from '@nestjs/common';
import { RabbitMqModule, StrategyModule } from '~/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [StrategyModule, RabbitMqModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
