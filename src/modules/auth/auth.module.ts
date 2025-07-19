import { Module } from '@nestjs/common';
import { StrategyModule } from '~/common';
import { MessagesModule } from '~/services';
import { DatabaseModule } from '../database';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [StrategyModule, DatabaseModule, MessagesModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
