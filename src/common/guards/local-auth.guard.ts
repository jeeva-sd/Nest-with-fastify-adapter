import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { appConfig } from '~/configs';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(appConfig.auth.publicAuthKey, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) return true; // Allow access to public routes without JWT validation
        return super.canActivate(context);
    }
}
