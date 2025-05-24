import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { badMessage } from '~/constants/events';
import { z, ZodSchema } from 'zod';

const logger = new Logger('RabbitMQDecorator');

export function AckHandler(schema?: ZodSchema<any>) {
    return (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const context: RmqContext = args.find((arg) => arg instanceof RmqContext);
            if (!context) {
                throw new Error('RmqContext not found in arguments.');
            }

            const channel = context.getChannelRef();
            const message = context.getMessage();

            try {
                const payload = args.find((arg) => typeof arg === 'object' && !Array.isArray(arg));

                // Validate message payload if schema is provided
                if (schema) {
                    try {
                        schema.parse(payload);
                    } catch (validationError) {
                        logger.warn(`🚨 Validation failed in ${propertyKey}: ${validationError.errors?.[0]?.message || validationError.message}`);
                        channel.nack(message, false, false); // Discard message permanently
                        return null;
                    }
                }

                const result = await originalMethod.apply(this, args);

                if (result === badMessage) {
                    logger.warn(`🚨 Discarding message in ${propertyKey}`);
                    channel.nack(message, false, false); // Discard the message permanently
                    return null;
                }

                channel.ack(message);
                return result;
            } catch (error) {
                logger.error(`❌ Error in ${propertyKey}: ${error.message}`, error.stack);
                channel.nack(message, false, true); // Retry message
            }
        };

        return descriptor;
    };
}
