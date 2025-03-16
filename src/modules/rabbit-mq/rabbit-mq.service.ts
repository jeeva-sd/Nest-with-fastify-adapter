import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMqService {
    constructor(@Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy) {}

    emit(pattern: string, data: unknown) {
        return this.rabbitMQClient.emit(pattern, data);
    }
}
