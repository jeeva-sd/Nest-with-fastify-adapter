import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { rabbitMQRoutes } from './rabbitmq.routes';

@Injectable()
export class MessagingService {
    @RabbitRPC(rabbitMQRoutes.general.userCreated)
    public async rpcHandler(msg) {
        console.log(msg, 'Received message in RPC high-level handler');
        return {
            response: 42
        };
    }

    @RabbitRPC(rabbitMQRoutes.connectionTwo.notificationEmail)
    public async rpcHandlesr(msg) {
        console.log(msg, 'Received message in RPC low-level handler');
        return {
            response: 42
        };
    }
}
