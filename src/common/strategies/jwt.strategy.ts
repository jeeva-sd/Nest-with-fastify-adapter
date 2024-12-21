import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from 'src/configs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: req => {
                // Try extracting the token from the Authorization header as Bearer token
                let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

                // If no token found in the header, try extracting it from query params
                if (!token && req?.payload?.xAccessToken) {
                    token = req.query.xAccessToken;
                }

                return token;
            },
            secretOrKey: appConfig.auth.jwt.secret,
            ignoreExpiration: false,
            passReqToCallback: true // Pass req to validate method
        });
    }

    async validate(_req: Request, user) {
        return user; // Return the validated user data
    }
}
