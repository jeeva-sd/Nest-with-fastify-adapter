import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { appConfig } from '~/configs';
import { MessagingService } from './consumer';
import { EventsEmitter } from './producer';

@Module({
    imports: [
        RabbitMQModule.forRoot({
            name: appConfig.rabbitMq.generalConnection.name,
            exchanges: [
                {
                    name: appConfig.rabbitMq.exchange.name,
                    type: appConfig.rabbitMq.exchange.type,
                    createExchangeIfNotExists: true,
                    options: appConfig.rabbitMq.exchange.options
                }
            ],
            queues: [
                {
                    name: appConfig.rabbitMq.generalQueue.name,
                    createQueueIfNotExists: appConfig.rabbitMq.generalQueue.createQueueIfNotExists
                }
            ],
            uri: appConfig.rabbitMq.uri,
            prefetchCount: appConfig.rabbitMq.generalConnection.prefetchCount,
            connectionInitOptions: { wait: true }
        }),
        RabbitMQModule.forRoot({
            name: appConfig.rabbitMq.connectionTwo.name,
            exchanges: [
                {
                    name: appConfig.rabbitMq.exchange.name,
                    type: appConfig.rabbitMq.exchange.type,
                    createExchangeIfNotExists: true,
                    options: appConfig.rabbitMq.exchange.options
                }
            ],
            queues: [
                {
                    name: appConfig.rabbitMq.generalQueue.name,
                    createQueueIfNotExists: appConfig.rabbitMq.generalQueue.createQueueIfNotExists
                }
            ],
            uri: appConfig.rabbitMq.uri,
            prefetchCount: appConfig.rabbitMq.connectionTwo.prefetchCount,
            connectionInitOptions: { wait: true }
        })
    ],
    providers: [MessagingService, EventsEmitter],
    exports: [RabbitMQModule, EventsEmitter]
})
export class RabbitExampleModule {}
