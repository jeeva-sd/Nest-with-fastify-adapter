import { Injectable } from '@nestjs/common';
import { generalEvents, singleConsumerEvents } from '~/modules/events/event.patterns';
import { JobsService } from '~/services';
import { DepartmentSyncDto } from '../eco-apps/schemas';

@Injectable()
export class AppEvents {
    constructor(private readonly jobsService: JobsService) {}

    async syncDepartment(data: DepartmentSyncDto, delayMs = 100) {
        return this.jobsService.publish(generalEvents.ecoApps.departmentSync, DepartmentSyncDto.parse(data), {
            delayMs
        });
    }

    async createUser(data: unknown, delayMs = 100) {
        return this.jobsService.publish(singleConsumerEvents.user.created, data, { delayMs });
    }
}
