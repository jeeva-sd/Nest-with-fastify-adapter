import {
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { RequestX, ResponseX, Sanitize, take } from 'src/utils';
import { newUserRule } from './user.rule';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @Sanitize(newUserRule)
    @UseGuards(JwtAuthGuard)
    async createUser(@Request() req: RequestX): Promise<ResponseX> {
        const response = await this.userService.findAll(req.payload);
        return take(1051, response);
    }

    @Post('v1')
    @Sanitize(newUserRule)
    @UseGuards(JwtAuthGuard)
    async createUserV1(@Request() req: RequestX): Promise<ResponseX> {
        const response = await this.userService.findAll(req.payload);
        return take(1051, response);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }
}
