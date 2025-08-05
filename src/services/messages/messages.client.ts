import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import { firstValueFrom } from 'rxjs';
import { Chalk } from '~/common';
import { appConfig } from '~/configs';
import { generalEvents, singleConsumerEvents } from '~/constants';
import { extractRoutingKeys } from './messages.config';

@Injectable()
export class MessagesClient implements OnModuleInit {
    private readonly config = appConfig.microservices.rabbitmq;
    private readonly logger = new Chalk(MessagesClient.name);

    constructor(
        @Inject('RmqGeneralClient')
        private readonly generalClient: ClientProxy,

        @Inject('RmqSingleConsumerClient')
        private readonly singleConsumerClient: ClientProxy
    ) {}

    async onModuleInit() {
        const { uri, exchange, queues } = this.config;

        const connection = await amqp.connect(uri);
        const channel = await connection.createChannel();

        this.logger.log(`Asserting exchange "${exchange.name}"...`);
        await channel.assertExchange(exchange.name, exchange.type, {
            durable: true,
            arguments: exchange.options.arguments
        });

        // Bind general queue
        const general = queues.general;
        await channel.assertQueue(general.name, { durable: general.durable });
        const generalRoutingKeys = extractRoutingKeys(generalEvents);
        for (const key of generalRoutingKeys) {
            await channel.bindQueue(general.name, exchange.name, key);
            this.logger.debug(`Bound routing key "${key}" to queue "${general.name}"`);
        }

        // Bind single-consumer queue
        const single = queues.singleConsumerQueue;
        await channel.assertQueue(single.name, { durable: single.durable });
        const singleRoutingKeys = extractRoutingKeys(singleConsumerEvents);
        for (const key of singleRoutingKeys) {
            await channel.bindQueue(single.name, exchange.name, key);
            this.logger.debug(`Bound routing key "${key}" to queue "${single.name}"`);
        }

        this.logger.log('All queues and routing keys successfully asserted and bound');

        await channel.close();
        await connection.close();
    }

    async emitWithDelay(pattern: string, data: unknown, delayMs: number) {
        const { uri, exchange } = this.config;

        const connection = await amqp.connect(uri);
        const channel = await connection.createChannel();

        const payload = { pattern, data };

        await channel.publish(exchange.name, pattern, Buffer.from(JSON.stringify(payload)), {
            headers: { 'x-delay': delayMs },
            contentType: 'application/json',
            persistent: true
        });

        this.logger.log(`Delayed message emitted to "${pattern}" with ${delayMs}ms delay`);

        await channel.close();
        await connection.close();
    }

    emit(pattern: string, data: unknown) {
        this.logger.log(`Emitting event to general client: ${pattern}`);
        return this.generalClient.emit(pattern, data);
    }

    async send(pattern: string, data: unknown) {
        this.logger.log(`Sending RPC request via general client: ${pattern}`);
        return await firstValueFrom(this.generalClient.send(pattern, data));
    }

    emitToSingleConsumer(pattern: string, data: unknown) {
        this.logger.log(`Emitting event to single-consumer client: ${pattern}`);
        return this.singleConsumerClient.emit(pattern, data);
    }
}
