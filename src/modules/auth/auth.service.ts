import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from '~/configs';

@Injectable()
export class AuthService {
    constructor(@Inject(appConfig.auth.basicJWT.name) private readonly jwtService: JwtService) {}

    async login() {
        const expiresIn = 60 * 60; // 1 hour
        const _token = this.jwtService.sign({ userId: 1, name: 'John' }, { expiresIn }); // Generate JWT token
    }
}
