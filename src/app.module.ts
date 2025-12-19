import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { RoleModule } from './modules/roles/role.module';
import { JobsModule } from './services';
import { DatabaseModule } from './services/database/database.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        RoleModule,
        JobsModule,
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
