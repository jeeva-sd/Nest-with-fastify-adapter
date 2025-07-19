import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { StrategyModule } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { RoleModule } from './modules/roles/roles.module';
import { MessagesModule } from './services';

@Module({
    imports: [
        AuthModule,
        StrategyModule,
        RoleModule,
        MessagesModule,
        EventsModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true }
        })
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
