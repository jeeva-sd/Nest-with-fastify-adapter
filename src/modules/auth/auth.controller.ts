import { Controller, HttpCode, Post, Request } from '@nestjs/common';
import { RequestX } from '~/common';
import { Events } from '../events/event.emitter';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly events: Events
    ) {}

    @HttpCode(200)
    @Post('login')
    async checkLogin(@Request() _req: RequestX) {
        return this.authService.login();
    }

    @HttpCode(200)
    @Post('profile')
    // @Sanitize(ProfileImageDto)
    async profile(@Request() _req: RequestX) {
        await this.events.createUser({ message: 'hi' });
    }
}
