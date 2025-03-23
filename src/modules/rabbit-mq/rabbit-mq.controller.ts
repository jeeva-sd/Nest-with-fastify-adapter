import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler } from 'src/common';
import { mqPattern } from 'src/constants/mqtt';
import * as yup from 'yup';

const userCreatedSchema = yup.object().shape({
    userId: yup.number().required(),
    points: yup.number().required().min(10),
});

@Controller()
export class RabbitMQConsumer {

    @MessagePattern(mqPattern.user.created)
    @AckHandler(userCreatedSchema)
    async handleUserCreated(@Payload() data: any, @Ctx() _context: RmqContext) {
        console.log('📥 Received user.created event:', data);
        return "hurray";
    }
}
