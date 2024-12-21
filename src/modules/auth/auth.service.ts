import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    findOne() {
        return `This action returns a auth`;
    }
}
