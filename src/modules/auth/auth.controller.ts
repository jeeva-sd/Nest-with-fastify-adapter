import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Sanitize, take } from 'src/utils';
import { loginRule } from './auth.rule';
import { EcoAppsGuard, JwtAuthGuard, LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @Sanitize(loginRule)
    @UseGuards(LocalAuthGuard)
    async login(@Request() req) {
        const response = await this.authService.login(req.user);
        return take(1051, response);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(EcoAppsGuard)
    @Get('eco-apps')
    getEcoApps(@Request() req) {
        return req.user;
    }
}
