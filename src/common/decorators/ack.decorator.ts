import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ZodType } from 'zod';

const logger = new Logger('RMQDecorator');

export function AckHandler(schema?: ZodType<unknown>) {
    return (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            const context: RmqContext = args.find(arg => arg instanceof RmqContext);
            if (!context) {
                throw new Error('RmqContext not found in arguments.');
            }

            const channel = context.getChannelRef();
            const message = context.getMessage();

            try {
                const payload = args.find(arg => typeof arg === 'object' && !Array.isArray(arg));

                // Validate message payload if schema is provided
                if (schema) {
                    try {
                        schema.parse(payload); // Zod's `parse` method for validation
                    } catch (validationError) {
                        const zodError = validationError as { errors?: { message?: string }[]; message?: string };
                        logger.warn(
                            `Validation failed in ${propertyKey}: ${zodError.errors?.[0]?.message || zodError.message}`
                        );
                        channel.nack(message, false, false); // Discard message permanently
                        return null;
                    }
                }

                const result = await originalMethod.apply(this, args);

                if (result === null) {
                    logger.warn(`Discarding message in ${propertyKey}`);
                    channel.nack(message, false, false); // Discard the message permanently
                    return null;
                }

                channel.ack(message);
                return result;
            } catch (error) {
                const err = error as Error;
                logger.error(`Error in ${propertyKey}: ${err.message}`, err.stack);
                channel.nack(message, false, true); // Retry message
            }
        };

        return descriptor;
    };
}
