import { Injectable } from '@nestjs/common';
import { NewUserPayload } from './users.rule';

@Injectable()
export class UserService {
    async findAll(newUserPayload: NewUserPayload) {
        return newUserPayload;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }
}
