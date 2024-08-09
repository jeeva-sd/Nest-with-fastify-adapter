import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { Exception } from 'src/utils';

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
                secret: jwtConstants.secret,
            });

            request.user = userData;
            return request.user;
        } catch (e) {
            throw new Exception(401, 'Invalid token');
        }
    }
}
