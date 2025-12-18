import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '~/configs';
import { EcoAppsModule } from '~/modules/eco-apps/eco-apps.module';
import { RoleModule } from '~/modules/roles/role.module';
import { JwtStrategy } from './jwt.strategy';
import { PortalBasicAuthStrategy } from './portal-basic.strategy';
import { PortalCookieAuthStrategy } from './portal-cookie.strategy';
import { ImpersonationGuard, JwtAuthGuard, PortalBasicAuthGuard, PortalCookieAuthGuard } from '../guards';

@Module({
    imports: [RoleModule, EcoAppsModule],
    providers: [
        JwtStrategy,
        PortalBasicAuthStrategy,
        PortalCookieAuthStrategy,
        JwtAuthGuard,
        PortalBasicAuthGuard,
        PortalCookieAuthGuard,
        ImpersonationGuard,
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
    exports: [appConfig.auth.basicJWT.name, JwtAuthGuard, PortalBasicAuthGuard, PortalCookieAuthGuard, ImpersonationGuard]
})
export class StrategyModule {}
