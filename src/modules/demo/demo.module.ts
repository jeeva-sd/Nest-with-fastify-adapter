import { Module } from '@nestjs/common';
import { RabbitExampleModule } from '~/services/rabbit-mq/rabbitmq.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
    imports: [RabbitExampleModule],
    controllers: [DemoController],
    providers: [DemoService]
})
export class DemoModule {}
