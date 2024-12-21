import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FileCleanupInterceptor, JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [
        JwtStrategy,
        LocalStrategy,
        LocalAuthGuard,
        JwtAuthGuard,
        {
            provide: APP_INTERCEPTOR,
            useClass: FileCleanupInterceptor
        }
    ]
})
export class AppModule {}
