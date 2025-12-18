import { Injectable } from '@nestjs/common';
import { generalEvents, singleConsumerEvents } from '~/modules/events/event.patterns';
import { JobsService } from '~/services';

@Injectable()
export class Events {
    constructor(private readonly jobsService: JobsService) {}

    async syncDepartment(data: unknown, delayMs?: number) {
        return this.jobsService.publish(generalEvents.ecoApps.departmentSync, data, { delayMs });
    }

    async createUser(data: unknown, delayMs?: number) {
        return this.jobsService.publish(singleConsumerEvents.user.created, data, { delayMs });
    }
}
