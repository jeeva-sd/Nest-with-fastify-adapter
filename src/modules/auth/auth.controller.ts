import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Sanitize } from 'src/common';
import { AuthService } from './auth.service';
import { nameSchema, xAccessToken } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    @Sanitize(nameSchema)
    findAll() {
        return this.authService.signIn();
    }

    @Get('check-login')
    @Sanitize(xAccessToken)
    @UseGuards(JwtAuthGuard)
    checkLogin() {
        return this.authService.findOne();
    }
}
