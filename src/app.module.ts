import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { FileCleanupInterceptor, JwtAuthGuard, LocalAuthGuard, StrategyModule } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { DemoModule } from './modules/demo/demo.module';
import { EventsModule } from './modules/events/events.module';

@Module({
    imports: [
        AuthModule,
        EventsModule,
        DemoModule,
        StrategyModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true }
        })
    ],
    controllers: [],
    providers: [
        LocalAuthGuard,
        JwtAuthGuard,
        {
            provide: APP_INTERCEPTOR,
            useClass: FileCleanupInterceptor
        }
    ]
})
export class AppModule {}
