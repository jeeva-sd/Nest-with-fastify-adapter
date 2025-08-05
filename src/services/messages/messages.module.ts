import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MessagesClient } from './messages.client';
import { RABBIT_MQ_QUEUE_KEYS, createRmqClientOptions } from './messages.config';

@Module({
    imports: [
        ClientsModule.register([
            createRmqClientOptions('RmqGeneralClient', RABBIT_MQ_QUEUE_KEYS.GENERAL),
            createRmqClientOptions('RmqSingleConsumerClient', RABBIT_MQ_QUEUE_KEYS.SINGLE_CONSUMER)
        ])
    ],
    providers: [MessagesClient],
    exports: [ClientsModule, MessagesClient]
})
export class MessagesModule {}
