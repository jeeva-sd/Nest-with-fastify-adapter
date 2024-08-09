import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EcoAppsGuard } from './guards/eco-apps.guard';
import { jwtConstants } from 'src/constants';
import { JwtAuthGuard, LocalAuthGuard } from './guards';

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
        EcoAppsGuard,
        JwtAuthGuard,
        LocalAuthGuard,
    ],
    controllers: [AuthController],
})
export class AuthModule {}
