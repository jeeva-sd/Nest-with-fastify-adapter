import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbit-mq.service';
import { RabbitMQConsumer } from './rabbit-mq.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://localhost'],
                    queue: 'localTestQueue',
                    queueOptions: { durable: true },
                },
            },
        ]),
    ],
    controllers: [RabbitMQConsumer],
    providers: [RabbitMqService],
    exports: [ClientsModule, RabbitMqService],
})
export class RabbitMqModule { }
