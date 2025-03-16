import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbit-mq.service';
import { RabbitMQConsumer } from './rabbit-mq.controller';
import { appConfig } from 'src/configs';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: appConfig.rabbitMq.general.name,
                transport: Transport.RMQ,
                options: appConfig.rabbitMq.general.options,
            },
        ]),
    ],
    controllers: [RabbitMQConsumer],
    providers: [RabbitMqService],
    exports: [ClientsModule, RabbitMqService],
})
export class RabbitMqModule { }
