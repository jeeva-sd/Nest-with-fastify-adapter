import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Exception } from 'src/utils';
import { appConfig } from 'src/config';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
    constructor(private jwtService: JwtService) {
        super();
    }

    async validate(request): Promise<any> {
        const token = request.params.token || request.query.token;
        if (!token) throw new Exception(401, 'Invalid token');

        try {
            const userData = this.jwtService.verify(token, {
                secret: appConfig.get('auth').jwt.secret,
            });

            request.user = userData;
            return request.user;
        } catch (e) {
            throw new Exception(401, 'Invalid token');
        }
    }
}
