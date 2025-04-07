import { Module } from '@nestjs/common';
import { JwtAuthGuard, LocalAuthGuard } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { DemoModule } from './modules/demo/demo.module';
import { EventsModule } from './modules/events/events.module';

@Module({
    imports: [AuthModule, EventsModule, DemoModule],
    controllers: [],
    providers: [LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
