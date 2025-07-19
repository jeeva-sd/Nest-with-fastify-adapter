import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler, Chalk, generalEvents } from '~/common';
import { DepartmentSyncDto } from './schemas';

@Controller()
export class EcoAppsEvents {
    private readonly chalk = new Chalk(EcoAppsEvents.name);

    constructor() {}

    @EventPattern(generalEvents.ecoApps.departmentSync)
    @AckHandler(DepartmentSyncDto)
    async handleDepartmentSync(@Payload() payload: DepartmentSyncDto, @Ctx() _context: RmqContext) {
        this.chalk.log(`${JSON.stringify(payload)}`);
    }
}
