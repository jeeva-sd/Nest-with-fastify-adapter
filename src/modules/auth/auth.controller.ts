import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, Sanitize, SkipJwtAuth } from 'src/common';
import { AuthService } from './auth.service';
import { fileSchema } from './schemas';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
         private readonly authService: AuthService) {}

    @Get()
    findAll() {
        const user = { userId: Date.now(), points: 10 };
        this.rabbitMQClient.emit('user.created', user);
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
    @SkipJwtAuth()
    checkLogin() {
        return this.authService.findOne();
    }
}
