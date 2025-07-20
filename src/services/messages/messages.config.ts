import { ClientProviderOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { appConfig } from '~/configs';

export const RABBIT_MQ_QUEUE_KEYS = {
    GENERAL: 'general',
    SINGLE_CONSUMER: 'singleConsumerQueue'
} as const;

export type RabbitMqQueueKey = (typeof RABBIT_MQ_QUEUE_KEYS)[keyof typeof RABBIT_MQ_QUEUE_KEYS];

// Use consolidated microservices.rabbitmq configuration
const BASE_OPTIONS = {
    urls: [appConfig.microservices.rabbitmq.uri], // Updated path
    exchange: appConfig.microservices.rabbitmq.exchange.name, // Updated path
    exchangeType: appConfig.microservices.rabbitmq.exchange.type, // Updated path
    exchangeArguments: appConfig.microservices.rabbitmq.exchange.options.arguments, // Updated path
    queueOptions: { durable: true }
};

function getQueueConfig(queueKey: RabbitMqQueueKey) {
    const queueConfig = appConfig.microservices.rabbitmq.queues[queueKey]; // Updated path

    if (!queueConfig) {
        throw new Error(`Queue config for key '${queueKey}' not found`);
    }

    return queueConfig;
}

// For microservices: allow ack/nack
export function buildRmqMicroserviceOptions(queueKey: RabbitMqQueueKey): RmqOptions['options'] {
    const queue = getQueueConfig(queueKey);
    return {
        ...BASE_OPTIONS,
        queue: queue.name,
        prefetchCount: queue.prefetchCount,
        noAck: false, // Required for ack/nack logic
        queueOptions: {
            durable: queue.durable
        }
    };
}

// For clients: set noAck to true for reply queue compatibility
export function buildRmqClientOptions(queueKey: RabbitMqQueueKey): RmqOptions['options'] {
    const queue = getQueueConfig(queueKey);
    return {
        ...BASE_OPTIONS,
        queue: queue.name,
        prefetchCount: queue.prefetchCount,
        noAck: true, // Required for .send() to work correctly
        queueOptions: {
            durable: queue.durable
        }
    };
}

export function createRmqClientOptions(name: string, queueKey: RabbitMqQueueKey): ClientProviderOptions {
    return {
        name,
        transport: Transport.RMQ,
        options: buildRmqClientOptions(queueKey) // Use client-specific config
    };
}

export function createRmqMicroserviceOptions(queueKey: RabbitMqQueueKey): RmqOptions {
    return {
        transport: Transport.RMQ,
        options: buildRmqMicroserviceOptions(queueKey) // Use microservice-specific config
    };
}

export function extractRoutingKeys(eventMap: Record<string, unknown>): string[] {
    const keys: string[] = [];

    function recurse(obj) {
        for (const value of Object.values(obj)) {
            if (typeof value === 'string') {
                keys.push(value);
            } else if (typeof value === 'object' && value !== null) {
                recurse(value);
            }
        }
    }

    recurse(eventMap);
    return keys;
}
