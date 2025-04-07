import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RabbitMqService, eventPatterns } from '~/common';

@Controller('demo')
@UseGuards(JwtAuthGuard)
export class DemoController {
    constructor(private readonly rabbitMQService: RabbitMqService) {}

    @Get('render')
    @Render('dummy.hbs')
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
