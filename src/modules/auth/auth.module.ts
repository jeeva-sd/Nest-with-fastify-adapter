import { Module } from '@nestjs/common';
import { MessagesModule } from '~/services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StrategyModule } from './strategies';

@Module({
    imports: [StrategyModule, MessagesModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
