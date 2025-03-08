import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Exception } from '../filters';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor() {
        super();
    }

    async validate(request: Request): Promise<any> {
        // Check headers
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new Exception(401);
        }

        // Validate credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (!username || !password) {
            throw new Exception(401);
        }

        return true;
    }
    catch() {
        throw new Exception(401);
    }
}
