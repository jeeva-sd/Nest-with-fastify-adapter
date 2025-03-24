import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import * as yup from 'yup';
import { AckHandler } from 'src/common';
import { eventPatterns } from 'src/constants/events';

const userCreatedSchema = yup.object().shape({
    userId: yup.number().required(),
    points: yup.number().required().min(10),
});

@Controller()
export class RabbitMQConsumer {

    @MessagePattern(eventPatterns.user.created)
    @AckHandler(userCreatedSchema)
    async handleUserCreated(@Payload() data: any, @Ctx() _context: RmqContext) {
        console.log('📥 Received user.created event:', data);
        return "hurray";
    }
}
