import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as yup from 'yup';
import { Sanitize } from './common';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @Sanitize(
        yup.object({
            name: yup.string().required(),
            age: yup.number().required()
        })
    )
    getHello(): string {
        return this.appService.getHello();
    }
}
