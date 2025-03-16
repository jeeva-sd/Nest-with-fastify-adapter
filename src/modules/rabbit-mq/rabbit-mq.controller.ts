import { Bind, Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class RabbitMQConsumer {

    @Bind(Payload(), Ctx())
    @MessagePattern('user.created')
    async handleUserCreated(data, context) {
        console.log('📥 Received user created event');

        const channel = context.getChannelRef();
        const message = context.getMessage();

        console.log(`📝 Logging user creation: ${JSON.stringify(data)}`);

        try {
            console.log(`✅ User created with data: ${JSON.stringify(data)}`);
            channel.ack(message);
        } catch (error) {
            console.error('❌ Error processing user.created event:', error);
            channel.nack(message, false, true);
        }
    }



}
