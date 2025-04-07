import { Module } from '@nestjs/common';
import { JwtAuthGuard, LocalAuthGuard, StrategyModule } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { DemoModule } from './modules/demo/demo.module';
import { EventsModule } from './modules/events/events.module';

@Module({
    imports: [AuthModule, EventsModule, DemoModule, StrategyModule],
    controllers: [],
    providers: [LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
