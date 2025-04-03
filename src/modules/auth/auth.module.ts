import { Module } from '@nestjs/common';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';
import { SharedModule } from '../shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [SharedModule, RabbitMqModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
