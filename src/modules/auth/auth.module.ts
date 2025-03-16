import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from '../shared/shared.module';
import { RabbitMqModule } from '../rabbit-mq/rabbit-mq.module';

@Module({
    imports: [SharedModule, RabbitMqModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }
