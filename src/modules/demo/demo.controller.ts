import { Controller, Get, Post, Render, UseGuards } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Access, JwtAuthGuard, RabbitMqService, RolesGuard, Sanitize, Store, eventPatterns } from '~/common';
import { ACL } from '../roles';
import { nameSchema } from './schema/demo.schema';

@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
    constructor(
        private readonly rabbitMQService: RabbitMqService,
        private readonly cls: ClsService<Store>
    ) {}

    @Post('render')
    @Render('dummy.hbs')
    @Sanitize(nameSchema)
    @Access(ACL.ManagerOrAdmin)
    getFile() {
        const user = this.cls.get('reqUser');
        console.log(user, 'user');
        return { message: 'Hello world!' };
    }

    @Get('mq')
    async sendMessage() {
        const user = { userId: Date.now(), points: 10 };
        const response = await this.rabbitMQService.send(eventPatterns.user.created, user);
        return response;
    }
}
