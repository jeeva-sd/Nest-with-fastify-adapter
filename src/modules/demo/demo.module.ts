import { Module } from '@nestjs/common';
import { RabbitMqModule, StrategyModule } from '~/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
    imports: [RabbitMqModule, StrategyModule],
    controllers: [DemoController],
    providers: [DemoService]
})
export class DemoModule {}
