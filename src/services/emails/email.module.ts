import { Module } from '@nestjs/common';
import { EmailsService } from './email.service';

@Module({
    providers: [EmailsService],
    exports: [EmailsService]
})
export class EmailsModule {}
