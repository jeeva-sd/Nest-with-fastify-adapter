import { Module } from '@nestjs/common';
import { StrategyModule } from '~/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [StrategyModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
