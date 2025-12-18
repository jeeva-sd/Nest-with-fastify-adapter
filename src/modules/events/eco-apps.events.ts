import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AckHandler, generalEvents, Helper, singleConsumerEvents } from '~/common';
import { DepartmentSyncDto } from './schemas';

@Controller()
export class EcoAppsEvents {
    private readonly logger = new Logger(EcoAppsEvents.name);

    @EventPattern(generalEvents.ecoApps.departmentSync)
    @AckHandler()
    async handleDepartmentSync(@Payload() payload: DepartmentSyncDto, @Ctx() _context: RmqContext) {
        await Helper.wait(3000);
        this.logger.log(`${JSON.stringify(payload)}`);
    }

    @EventPattern(singleConsumerEvents.user.created)
    @AckHandler()
    async handleUserCreated(@Payload() payload: DepartmentSyncDto, @Ctx() _context: RmqContext) {
        await Helper.wait(3000);
        this.logger.log(`${JSON.stringify(payload)}`);
    }
}
