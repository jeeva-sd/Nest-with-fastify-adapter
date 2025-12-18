import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createRmqClientOptions, RABBIT_MQ_QUEUE_KEYS } from './jobs.config';
import { JobsService } from './jobs.service';

@Module({
    imports: [
        ClientsModule.register([
            createRmqClientOptions('RmqGeneralClient', RABBIT_MQ_QUEUE_KEYS.GENERAL),
            createRmqClientOptions('RmqSingleConsumerClient', RABBIT_MQ_QUEUE_KEYS.SINGLE_CONSUMER)
        ])
    ],
    providers: [JobsService],
    exports: [ClientsModule, JobsService]
})
export class JobsModule {}
