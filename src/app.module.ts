import { Module } from '@nestjs/common';
import { JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy } from './common';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [JwtStrategy, LocalStrategy, LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
