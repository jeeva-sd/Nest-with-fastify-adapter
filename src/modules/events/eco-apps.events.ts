import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler, generalEvents } from '~/common';
import { DepartmentSyncDto } from './schemas';

@Controller()
export class EcoAppsEvents {
    private readonly logger = new Logger(EcoAppsEvents.name);

    constructor() {}

    @EventPattern(generalEvents.ecoApps.departmentSync)
    @AckHandler(DepartmentSyncDto)
    async handleDepartmentSync(@Payload() payload: DepartmentSyncDto, @Ctx() _context: RmqContext) {
        this.logger.log(`${JSON.stringify(payload)}`);
    }
}
