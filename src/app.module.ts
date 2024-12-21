import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [JwtStrategy, LocalStrategy, LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
