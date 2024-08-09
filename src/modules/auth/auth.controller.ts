import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseX, Sanitize, take } from 'src/utils';
import { loginRule } from './auth.rule';
import { CustomAuthGuard, JwtAuthGuard, LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @Sanitize(loginRule)
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<ResponseX> {
        const response = await this.authService.login(req.user);
        return take(1051, response);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('eco-apps')
    @UseGuards(CustomAuthGuard)
    getEcoApps(@Request() req) {
        return {
            ...req.user,
            ecoApps: [
                { id: 1, name: 'EcoApp 1' },
                { id: 2, name: 'EcoApp 2' },
            ],
        };
    }
}
