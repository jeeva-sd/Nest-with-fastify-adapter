import { Controller, HttpCode, Post, Request } from '@nestjs/common';
import { RequestX, Sanitize } from '~/common';
import { AuthService } from './auth.service';
import { ProfileImageDto } from './dto/profile.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @Post('login')
    async checkLogin(@Request() _req: RequestX) {
        return this.authService.login();
    }

    @HttpCode(200)
    @Post('profile')
    @Sanitize(ProfileImageDto)
    async profile(@Request() req: RequestX) {
        console.log(req.payload);
    }
}
