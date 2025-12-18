import { Injectable } from '@nestjs/common';
import { appConfig } from '~/configs/envs/envs.reader';
import { generalEvents, singleConsumerEvents } from '~/constants/events';
import { JobsService } from '~/services';

@Injectable()
export class Events {
    private readonly exchange = appConfig.microservices.rabbitmq.exchange;

    constructor(private readonly jobsService: JobsService) {}

    async syncDepartment(data: unknown, delayMs?: number) {
        const pattern = generalEvents.ecoApps.departmentSync;
        return this.jobsService.publish(pattern, data, { delayMs });
    }

    async createUser(data: unknown, delayMs?: number) {
        const pattern = singleConsumerEvents.user.created;
        return this.jobsService.publish(pattern, data, { delayMs });
    }
}
