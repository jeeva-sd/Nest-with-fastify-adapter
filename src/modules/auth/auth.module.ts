import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SharedModule } from '../shared/shared.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [SharedModule,
        ClientsModule.register([
            {
              name: 'RABBITMQ_SERVICE', // RabbitMQ client
              transport: Transport.RMQ,
              options: {
                urls: ['amqp://localhost'],
                queue: 'localTestQueue',
                queueOptions: { durable: true },
              },
            },
          ]),
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
