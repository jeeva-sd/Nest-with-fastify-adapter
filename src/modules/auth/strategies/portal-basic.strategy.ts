import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { RequestX } from '~/common';
import { appConfig } from '~/configs';

@Injectable()
export class PortalBasicAuthStrategy extends PassportStrategy(Strategy, 'portal-basic-auth') {
    async validate(request: RequestX) {
        const authHeader = request?.headers?.authorization;
        if (!authHeader?.startsWith('Basic ')) {
            throw new UnauthorizedException('Authorization header is missing or invalid.');
        }

        try {
            // Validate credentials
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');

            const { portal } = appConfig.ecoApps;
            if (username !== portal.auth.userName || password !== portal.auth.password) {
                throw new UnauthorizedException('Invalid username or password.');
            }

            return true;
        } catch (_error) {
            throw new UnauthorizedException('Failed to validate credentials.');
        }
    }
}
