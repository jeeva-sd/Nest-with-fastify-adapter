import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(@Inject('UserJwtService') private readonly jwtService: JwtService) {}

    findOne() {
        return `This action returns a auth`;
    }

    async signIn() {
        const payload = { username: 'John', sub: '123' };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
