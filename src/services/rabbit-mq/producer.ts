import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { appConfig } from '~/configs';

@Injectable()
export class EventsEmitter {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    async emit(routeKey: string, payload: any) {
        return await this.amqpConnection.publish(appConfig.rabbitMq.exchange.name, routeKey, payload);
    }
}
