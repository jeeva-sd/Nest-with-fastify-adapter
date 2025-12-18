import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { RequestX } from '~/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    async validate(request: RequestX) {
        // Check headers
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Basic ')) {
            throw new UnauthorizedException(401);
        }

        // Validate credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (!(username && password)) {
            throw new UnauthorizedException(401);
        }

        return true;
    }
    catch() {
        throw new UnauthorizedException(401);
    }
}
