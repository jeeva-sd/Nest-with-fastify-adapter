import { Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

const logger = new Logger('RabbitMQDecorator');

export function AckHandler() {
    return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const context: RmqContext = args.find(arg => arg instanceof RmqContext);
            if (!context) {
                throw new Error('RmqContext not found in arguments.');
            }

            const channel = context.getChannelRef();
            const message = context.getMessage();

            try {
                await originalMethod.apply(this, args);
                channel.ack(message);
            } catch (error) {
                logger.error(`❌ Error in ${propertyKey}: ${error.message}`, error.stack);
                channel.nack(message, false, true);
            }
        };

        return descriptor;
    };
}
