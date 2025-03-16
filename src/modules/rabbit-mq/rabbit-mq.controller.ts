import { Bind, Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler } from 'src/common';

@Controller()
export class RabbitMQConsumer {

    @EventPattern('user.created')
    @AckHandler()
    async handleUserCreated(@Payload() data: any, @Ctx() _context: RmqContext) {
        console.log('📥 Received user.created event:', data);
    }
}
