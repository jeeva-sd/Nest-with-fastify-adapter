import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { appConfig } from '~/configs';
import { generalEvents, singleConsumerEvents } from '~/constants';
import { extractRoutingKeys } from './jobs.config';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(JobsService.name);
    private readonly config = appConfig.microservices.rabbitmq;

    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private reconnecting = false;
    private initialized = false;
    private isShuttingDown = false;
    private isClosing = false;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private maxReconnectAttempts = 10;
    private reconnectAttempts = 0;

    async onModuleInit() {
        await this.initializeChannel();
        await this.setupQueuesAndBindings();
    }

    async onModuleDestroy() {
        this.isShuttingDown = true;

        // Clear any pending reconnection timeouts
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        await this.closeChannel();
    }

    /**
     * Initialize singleton channel
     */
    private async initializeChannel(): Promise<void> {
        if (this.channel && this.connection) {
            return; // Already initialized
        }

        const { uri } = this.config;

        try {
            this.connection = await amqp.connect(uri);
            this.channel = await this.connection.createChannel();

            // Handle connection errors
            this.connection.on('error', async err => {
                if (!this.isShuttingDown) {
                    this.logger.error('RabbitMQ connection error:', err);
                    await this.reconnect();
                }
            });

            this.connection.on('close', async () => {
                if (!this.isShuttingDown) {
                    this.logger.warn('RabbitMQ connection closed');
                    await this.reconnect();
                }
            });

            this.channel.on('error', async err => {
                if (!this.isShuttingDown) {
                    this.logger.error('RabbitMQ channel error:', err);
                    await this.reconnect();
                }
            });

            this.channel.on('close', () => {
                if (!this.isShuttingDown) {
                    this.logger.warn('RabbitMQ channel closed');
                }
            });

            this.reconnectAttempts = 0; // Reset on successful connection
            this.logger.log('Singleton RabbitMQ channel initialized');
        } catch (error) {
            this.logger.error('Failed to initialize RabbitMQ channel:', error);
            if (!this.isShuttingDown) {
                await this.reconnect();
            }
        }
    }

    /**
     * Setup queues and bindings
     */
    private async setupQueuesAndBindings(): Promise<void> {
        if (this.initialized) {
            return; // Already set up
        }

        const { exchange, queues } = this.config;
        const channel = await this.ensureChannel();

        try {
            this.logger.log(`Asserting exchange "${exchange.name}"...`);
            await channel.assertExchange(exchange.name, exchange.type, {
                durable: true,
                arguments: exchange.options.arguments
            });

            // Bind general processing queue
            const generalQueue = queues.general;
            await channel.assertQueue(generalQueue.name, { durable: generalQueue.durable });

            // Bind general routing keys
            const generalRoutingKeys = extractRoutingKeys(generalEvents);
            for (const key of generalRoutingKeys) {
                await channel.bindQueue(generalQueue.name, exchange.name, key);
                this.logger.debug(`Bound routing key "${key}" to queue "${generalQueue.name}"`);
            }

            // Bind single consumer queue
            const singleConsumerQueue = queues.singleConsumerQueue;
            await channel.assertQueue(singleConsumerQueue.name, { durable: singleConsumerQueue.durable });

            // Bind single consumer routing keys
            const singleConsumerRoutingKeys = extractRoutingKeys(singleConsumerEvents);
            for (const key of singleConsumerRoutingKeys) {
                await channel.bindQueue(singleConsumerQueue.name, exchange.name, key);
                this.logger.debug(`Bound routing key "${key}" to queue "${singleConsumerQueue.name}"`);
            }

            this.initialized = true;
            this.logger.log('All queues and routing keys successfully asserted and bound');
        } catch (error) {
            this.logger.error('Failed to setup queues and bindings:', error);
            throw error;
        }
    }

    /**
     * Reconnect on connection failure
     */
    private async reconnect(): Promise<void> {
        if (this.reconnecting || this.isShuttingDown || this.isClosing) {
            return; // Already reconnecting, shutting down, or closing
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error(
                `Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`
            );
            return;
        }

        this.reconnecting = true;
        this.reconnectAttempts++;

        // Remove event listeners to prevent duplicate reconnection attempts
        this.removeEventListeners();

        this.channel = null;
        this.connection = null;
        this.initialized = false;

        try {
            this.logger.log(
                `Reconnecting to RabbitMQ in 5 seconds... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );

            await new Promise<void>((resolve, reject) => {
                this.reconnectTimeout = setTimeout(() => {
                    if (this.isShuttingDown) {
                        reject(new Error('Shutdown in progress'));
                    } else {
                        resolve();
                    }
                }, 5000);
            });

            if (!this.isShuttingDown) {
                await this.initializeChannel();
                await this.setupQueuesAndBindings(); // Re-setup after reconnection
                this.logger.log('Successfully reconnected to RabbitMQ');
            }
        } catch (error) {
            if (!this.isShuttingDown) {
                this.logger.error('Failed to reconnect to RabbitMQ:', error);
                // Don't recursively call reconnect - let it be triggered by error events
            }
        } finally {
            this.reconnecting = false;
            this.reconnectTimeout = null;
        }
    }

    /**
     * Remove event listeners from connection and channel
     */
    private removeEventListeners(): void {
        try {
            if (this.connection) {
                this.connection.removeAllListeners('error');
                this.connection.removeAllListeners('close');
            }
            if (this.channel) {
                this.channel.removeAllListeners('error');
                this.channel.removeAllListeners('close');
            }
        } catch (_error) {
            // Ignore errors during cleanup
        }
    }

    /**
     * Close singleton channel
     */
    private async closeChannel(): Promise<void> {
        // Prevent double-close attempts
        if (this.isClosing) {
            return;
        }

        this.isClosing = true;
        this.removeEventListeners();

        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            this.initialized = false;
            this.logger.log('Singleton RabbitMQ channel closed');
        } catch (error) {
            // Only log error if it's not the expected "Channel closing" error
            if (error instanceof Error && !error.message.includes('Channel closing')) {
                this.logger.error('Error closing RabbitMQ channel:', error);
            }
        }
    }

    /**
     * Ensure channel is available
     */
    private async ensureChannel(): Promise<amqp.Channel> {
        if (!this.channel || !this.connection) {
            await this.initializeChannel();
        }
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        return this.channel;
    }

    /**
     * Publish message to exchange
     */
    async publish(
        exchangeName: string,
        routingKey: string,
        data: unknown,
        options?: {
            delayMs?: number;
            persistent?: boolean;
        }
    ): Promise<boolean> {
        const channel = await this.ensureChannel();

        const payload = { pattern: routingKey, data };

        const publishOptions: amqp.Options.Publish = {
            contentType: 'application/json',
            persistent: options?.persistent ?? true
        };

        if (options?.delayMs) {
            publishOptions.headers = { 'x-delay': options.delayMs };
        }

        const buffer = Buffer.from(JSON.stringify(payload));

        const published = channel.publish(exchangeName, routingKey, buffer, publishOptions);

        if (!published) {
            this.logger.warn(`Message not published to "${routingKey}", channel buffer full`);
            // Wait for drain event
            await new Promise<void>(resolve => {
                channel.once('drain', () => resolve());
            });
        }

        return published;
    }

    /**
     * Get raw channel for advanced operations
     */
    async getChannel(): Promise<amqp.Channel> {
        return this.ensureChannel();
    }

    /**
     * Check if channel is healthy
     */
    isHealthy(): boolean {
        return this.channel !== null && this.connection !== null && !this.reconnecting && this.initialized;
    }
}
