import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { appConfig } from 'src/configs';
import { Helper } from 'src/common';
import { RabbitMqService } from './rabbit-mq.service';
import { RabbitMQConsumer } from './rabbit-mq.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: appConfig.rabbitMq.general.name,
                transport: Transport.RMQ,
                options: Helper.Object.omit(appConfig.rabbitMq.general.options, ['noAck']),
            },
        ]),
    ],
    controllers: [RabbitMQConsumer],
    providers: [RabbitMqService],
    exports: [ClientsModule, RabbitMqService],
})
export class RabbitMqModule { }
