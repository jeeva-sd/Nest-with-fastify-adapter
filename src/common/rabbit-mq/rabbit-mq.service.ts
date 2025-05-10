import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { appConfig } from '~/configs';

@Injectable()
export class RabbitMqService {
    constructor(@Inject(appConfig.rabbitMq.general.name) private readonly rabbitMQGeneralClient: ClientProxy) {}

    emit(pattern: string, data: unknown) {
        return this.rabbitMQGeneralClient.emit(pattern, data);
    }

    async send(pattern: string, data: unknown) {
        return await firstValueFrom(this.rabbitMQGeneralClient.send(pattern, data));
    }
}
