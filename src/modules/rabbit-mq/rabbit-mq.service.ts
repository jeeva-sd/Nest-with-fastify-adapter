import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { appConfig } from 'src/configs';

@Injectable()
export class RabbitMqService {
    constructor(@Inject(appConfig.rabbitMq.general.name) private readonly rabbitMQClient: ClientProxy) {}

    emit(pattern: string, data: unknown) {
        return this.rabbitMQClient.emit(pattern, data);
    }

    async send(pattern: string, data: unknown) {
        return await firstValueFrom(this.rabbitMQClient.send(pattern, data));
    }
}
