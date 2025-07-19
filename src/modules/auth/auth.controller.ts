import { Controller, HttpCode, Post, Request } from '@nestjs/common';
import { RequestX } from '~/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @Post('login')
    async checkLogin(@Request() _req: RequestX) {
        return this.authService.login();
    }
}
