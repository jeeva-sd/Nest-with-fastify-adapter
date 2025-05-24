import { Controller, Get, Post, Render, UseGuards } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Access, JwtAuthGuard, RolesGuard, Sanitize, Store } from '~/common';
import { ACL } from '~/configs';
import { nameSchema } from './schema/demo.schema';

@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
    constructor(private readonly cls: ClsService<Store>) {}

    @Post('render')
    @Render('dummy.hbs')
    @Sanitize(nameSchema)
    @Access(ACL.manageUsers)
    getFile() {
        const user = this.cls.get('reqUser');
        console.log(user, 'user');
        return { message: 'Hello world!' };
    }

    @Get('mq')
    async sendMessage() {
        const _user = { userId: Date.now(), points: 10 };
        return 'response from sendMessage';
    }
}
