import { appConfig } from '~/configs';

const { generalQueue, exchange, generalConnection, connectionTwo } = appConfig.rabbitMq;

export const rabbitMQRoutes = {
    general: {
        userCreated: {
            connection: generalConnection.name,
            queue: generalQueue.name,
            exchange: exchange.name,
            routingKey: 'user.created'
        }
    },
    connectionTwo: {
        notificationEmail: {
            connection: connectionTwo.name,
            queue: generalQueue.name,
            exchange: exchange.name,
            routingKey: 'notify.email'
        }
    }
} as const;
