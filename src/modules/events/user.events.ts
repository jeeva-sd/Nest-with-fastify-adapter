import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler, eventPatterns } from '~/common';
import { userCreatedMessage } from './schemas';

@Controller()
export class UserEvents {
    @MessagePattern(eventPatterns.user.created)
    @AckHandler(userCreatedMessage)
    async handleUserCreated(@Payload() data: unknown, @Ctx() _context: RmqContext) {
        console.log('📥 Received user.created event:', data);
        return 'hurray';
    }
}
