import { Controller, Get } from '@nestjs/common';
import { Sanitize } from 'src/common';
import { AuthService } from './auth.service';
import { nameSchema } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    @Sanitize(nameSchema)
    findAll() {
        return this.authService.findOne();
    }
}
