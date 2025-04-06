import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '~/configs';

@Injectable()
export class AuthService {
    constructor(@Inject(appConfig.auth.basicJWT.name) private readonly jwtService: JwtService) {}

    findOne() {
        return 'This action returns a auth';
    }

    async signIn() {
        const payload = { username: 'John', sub: '123' };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
