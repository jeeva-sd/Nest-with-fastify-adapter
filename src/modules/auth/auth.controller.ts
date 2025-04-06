import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RabbitMqService, Roles, RolesGuard, Sanitize, eventPatterns } from '~/common';
import { AuthService } from './auth.service';
import { fileSchema } from './schemas';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly rabbitMQService: RabbitMqService,
        private readonly authService: AuthService
    ) {}

    @Get()
    async findAll() {
        const user = { userId: Date.now(), points: 10 };
        const response = await this.rabbitMQService.send(eventPatterns.user.created, user);
        return response;
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
