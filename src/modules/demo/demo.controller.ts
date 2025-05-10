import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { Access, JwtAuthGuard, RabbitMqService, RolesGuard, eventPatterns } from '~/common';
import { AccessPolicies } from '~/modules/roles';

@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
    constructor(private readonly rabbitMQService: RabbitMqService) { }

    @Get('render')
    @Render('dummy.hbs')
    @Access(AccessPolicies.AdminOnly)
    getFile() {
        return { message: 'Hello world!' };
    }

    @Get('mq')
    async sendMessage() {
        const user = { userId: Date.now(), points: 10 };
        const response = await this.rabbitMQService.send(eventPatterns.user.created, user);
        return response;
    }
}
