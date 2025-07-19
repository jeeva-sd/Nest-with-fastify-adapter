import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '~/configs';
import { JwtAuthGuard, LocalAuthGuard } from '../guards';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
    imports: [],
    providers: [
        JwtStrategy,
        {
            provide: appConfig.auth.basicJWT.name,
            useFactory: () => {
                return new JwtService({
                    secret: appConfig.auth.basicJWT.secret,
                    signOptions: { expiresIn: appConfig.auth.basicJWT.expiresIn }
                });
            }
        }
        // {
        //     provide: 'CandidateJwtService',
        //     useFactory: () => {
        //         return new JwtService({
        //             secret: appConfig.auth.candidateJwt.secret,
        //             signOptions: { expiresIn: appConfig.auth.candidateJwt.expiresIn }
        //         });
        //     }
        // }
    ],
    exports: [appConfig.auth.basicJWT.name]
})
export class StrategyModule {}
