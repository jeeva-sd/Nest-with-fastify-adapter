import { Injectable } from '@nestjs/common';
import { NewUserPayload } from './user.rule';
import { Helper } from 'src/utils';

@Injectable()
export class UserService {
    async findAll(newUserPayload: NewUserPayload) {
        await Helper.File.readFile(newUserPayload.profileOne.filePath);
        return `This action returns all user`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }
}
