import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StrategyModule } from './strategies/strategy.module';

@Module({
    imports: [StrategyModule, EventsModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
