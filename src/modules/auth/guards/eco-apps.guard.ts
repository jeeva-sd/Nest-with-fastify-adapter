import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';

@Injectable()
export class EcoAppsGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.params.token || request.query.token;

        if (!token) {
            return false;
        }

        try {
            const payload = this.jwtService.verify(token, {
                secret: jwtConstants.secret,
            });
            request.user = payload;
            return true;
        } catch (e) {
            return false;
        }
    }
}
