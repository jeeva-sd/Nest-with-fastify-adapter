import { Module } from '@nestjs/common';
import { RabbitMqModule } from '~/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
    imports: [RabbitMqModule],
    controllers: [DemoController],
    providers: [DemoService]
})
export class DemoModule {}
