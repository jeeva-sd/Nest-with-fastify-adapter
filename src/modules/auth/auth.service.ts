import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const users = [
    {
        username: 'admin',
        password: 'admin',
        userId: 1,
    },
    {
        username: 'user',
        password: 'user',
        userId: 2,
    },
];

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        return users.find(
            (u) => u.username === username && u.password === pass,
        );
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            ...payload,
            access_token: this.jwtService.sign(payload),
        };
    }
}
