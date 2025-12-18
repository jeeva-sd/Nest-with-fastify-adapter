import { Injectable } from '@nestjs/common';
import { generalEvents, singleConsumerEvents } from '~/modules/events/event.patterns';
import { JobsService } from '~/services';

@Injectable()
export class Events {
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
