import { Controller, Get, Post, Render } from '@nestjs/common';
import { Access, RabbitMqService, Sanitize, eventPatterns } from '~/common';
import { ACL } from '~/modules/roles';
import { nameSchema } from './schema/demo.schema';

@Controller('demo')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
    constructor(private readonly rabbitMQService: RabbitMqService) {}

    @Post('render')
    @Render('dummy.hbs')
    @Sanitize(nameSchema)
    @Access(ACL.AdminOnly)
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
