import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    findAll() {
        return `This action returns all user`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }
}
