import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { appConfig } from 'src/configs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(appConfig.auth.publicAuthKey, [
            context.getHandler(),
            context.getClass()
        ]);

        const skipJwt = this.reflector.getAllAndOverride<boolean>(appConfig.auth.skipJwtAuthKey, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic || skipJwt) return true; // Allow access to public routes without JWT validation
        return super.canActivate(context);
    }
}
