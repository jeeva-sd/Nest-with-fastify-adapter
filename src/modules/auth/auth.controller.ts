import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-in')
    findOne() {
        return this.authService.signIn();
    }
}
