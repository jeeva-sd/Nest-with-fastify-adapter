import { Controller, Get, Post, Render } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Access, Sanitize, Store } from '~/common';
import { ACL } from '~/configs';
import { rabbitMQRoutes } from '~/services';
import { EventsEmitter } from '~/services/rabbit-mq/producer';
import { nameSchema } from './schema/demo.schema';

@Controller('demo')
export class DemoController {
    constructor(
        private readonly cls: ClsService<Store>,
        private readonly events: EventsEmitter
    ) {}

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
        const user = { userId: Date.now(), points: 10 };
        const a = await this.events.emit(rabbitMQRoutes.general.userCreated.routingKey, { msg: user });
        console.log(a, 'a');
        return 'response from sendMessage';
    }
}
