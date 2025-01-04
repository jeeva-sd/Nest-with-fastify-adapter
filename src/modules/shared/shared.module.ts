import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/configs';

@Module({
    providers: [
        {
            provide: 'UserJwtService',
            useFactory: () => {
                return new JwtService({
                    secret: appConfig.auth.jwt.secret,
                    signOptions: { expiresIn: appConfig.auth.jwt.expiresIn }
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
    exports: ['UserJwtService']
})
export class SharedModule {}
