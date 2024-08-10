import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { RequestX, ResponseX, Sanitize, take } from 'src/utils';
import { CustomAuthGuard, JwtAuthGuard, LocalAuthGuard } from './guards';
import { AuthService } from './auth.service';
import { loginRule } from './auth.rule';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @Sanitize(loginRule)
    @UseGuards(LocalAuthGuard)
    async login(@Request() req: RequestX): Promise<ResponseX> {
        const response = await this.authService.login(req.user);
        return take(1051, response);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: RequestX): ResponseX {
        return take(200, req.user);
    }

    @Get('eco-apps')
    @UseGuards(CustomAuthGuard)
    getEcoApps(@Request() req: RequestX): ResponseX {
        const response = {
            ...req.user,
            ecoApps: [
                { id: 1, name: 'EcoApp 1' },
                { id: 2, name: 'EcoApp 2' }
            ]
        };

        return take(200, response);
    }
}
