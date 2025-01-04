import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, Sanitize } from 'src/common';
import { AuthService } from './auth.service';
import { fileSchema } from './schemas';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    findAll() {
        return this.authService.signIn();
    }

    @Post()
    @Sanitize(fileSchema)
    findOne() {
        return this.authService.signIn();
    }

    @Get('check-login')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admins')
    checkLogin() {
        return this.authService.findOne();
    }
}
