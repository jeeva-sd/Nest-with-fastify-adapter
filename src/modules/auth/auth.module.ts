import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from 'src/constants';
import { CustomAuthGuard, JwtAuthGuard, LocalAuthGuard } from './guards';
import { JwtStrategy, LocalStrategy, CustomStrategy } from './strategies';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        CustomStrategy,
        CustomAuthGuard,
        JwtAuthGuard,
        LocalAuthGuard,
    ],
    controllers: [AuthController],
})
export class AuthModule {}
