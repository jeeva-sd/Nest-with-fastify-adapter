import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestX } from '~/common';
import { appConfig } from '~/configs';
import { Store } from '~/store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cls: ClsService<Store>) {
        super({
            jwtFromRequest: (req: RequestX) => {
                const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                return token;
            },
            secretOrKey: appConfig.auth.basicJWT.secret,
            ignoreExpiration: false,
            passReqToCallback: true // Pass req to validate method
        });
    }

    async validate(_req: RequestX, user) {
        // Store requested user info in global store
        this.cls.set('reqUser', user);
        return user; // Return the validated user data
    }
}
