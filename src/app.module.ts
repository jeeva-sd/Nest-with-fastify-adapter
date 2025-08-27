import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { RoleModule } from './modules/roles/roles.module';
import { MessagesModule } from './services';

@Module({
    imports: [
        AuthModule,
        RoleModule,
        MessagesModule,
        EventsModule,
        HealthModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true }
        })
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
