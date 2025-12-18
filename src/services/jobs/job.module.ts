import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createRmqClientOptions, RABBIT_MQ_QUEUE_KEYS } from './job.helper';
import { JobsService } from './job.service';

@Module({
    imports: [
        ClientsModule.register([
            // biome-ignore lint/security/noSecrets: client name for RabbitMQ
            createRmqClientOptions('RmqGeneralClient', RABBIT_MQ_QUEUE_KEYS.GENERAL),
            // biome-ignore lint/security/noSecrets: client name for RabbitMQ
            createRmqClientOptions('RmqSingleConsumerClient', RABBIT_MQ_QUEUE_KEYS.SINGLE_CONSUMER)
        ])
    ],
    providers: [JobsService],
    exports: [ClientsModule, JobsService]
})
export class JobsModule {}
