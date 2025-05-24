import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from '~/configs';
import { Store } from '../../store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cls: ClsService<Store>) {
        super({
            jwtFromRequest: (req) => {
                // Try extracting the token from the Authorization header as Bearer token
                let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

                // If no token found in the header, try extracting it from query params
                if (!token && req?.query?.xAccessToken) {
                    token = req.query.xAccessToken;
                }

                return token;
            },
            secretOrKey: appConfig.auth.basicJWT.secret,
            ignoreExpiration: false,
            passReqToCallback: true // Pass req to validate method
        });
    }

    async validate(_req: Request, user) {
        // Store requested user info in global store
        this.cls.set('reqUser', user);

        return user; // Return the validated user data
    }
}
