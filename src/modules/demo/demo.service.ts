import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoService {
    findOne(id: number) {
        return `This action returns a #${id} demo`;
    }
}
