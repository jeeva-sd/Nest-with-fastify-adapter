import { Module } from '@nestjs/common';
import { RabbitMqService } from './rabbit-mq.service';
import { RabbitMQConsumer } from './rabbit-mq.controller';

@Module({
  controllers: [RabbitMQConsumer],
  providers: [RabbitMqService],
})
export class RabbitMqModule {}
