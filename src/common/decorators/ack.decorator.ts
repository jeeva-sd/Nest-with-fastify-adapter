import { RmqContext } from '@nestjs/microservices';
import { ZodSchema, z } from 'zod/v4';
import { badMessage } from '~/constants/events';
import { readError } from '../utils';
import { Chalk } from '../interceptors';

const logger = new Chalk('RabbitMQDecorator');

export function AckHandler(schema?: ZodSchema<any>) {
    return (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const context: RmqContext = args.find(arg => arg instanceof RmqContext);
            if (!context) {
                throw new Error('RmqContext not found in arguments.');
            }

            const channel = context.getChannelRef();
            const message = context.getMessage();
            const routingKey = message.fields.routingKey;

            try {
                const payloadIndex = args.findIndex(arg => typeof arg === 'object' && !Array.isArray(arg));
                const payload = args[payloadIndex];

                // Validate and coerce the payload if schema is provided
                if (schema) {
                    try {
                        const coercedPayload = schema.parse(payload); // Coerce and validate
                        args[payloadIndex] = coercedPayload; // Replace the original payload with the coerced one
                    } catch (validationError) {
                        let errMessage: string;

                        if (validationError instanceof z.ZodError) {
                            errMessage = z.prettifyError(validationError);
                        } else {
                            // Handle non-Zod errors
                            errMessage = readError(validationError) || 'Payload validation failed';
                        }

                        logger.error(`Validation error in ${propertyKey} for routing key ${routingKey}: ${errMessage}`);
                        channel.nack(message, false, false); // Discard message permanently
                        return null;
                    }
                }

                const result = await originalMethod.apply(this, args);

                if (result === badMessage) {
                    logger.warn(`Discarding message in ${propertyKey} for routing key ${routingKey}`);
                    // channel.nack(message, false, false); // Discard the message permanently
                    return null;
                }

                channel.ack(message);
                return result;
            } catch (error) {
                logger.error(`Error in ${propertyKey} for routing key ${routingKey}: ${error.message}`, error.stack);
                // channel.nack(message, false, true); // Retry message
            }
        };

        return descriptor;
    };
}
