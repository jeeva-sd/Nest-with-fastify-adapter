import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from 'src/configs';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get(appConfig.auth.roleKey, context.getHandler());
        if (!roles) return true;

        const request = context.switchToHttp().getRequest();
        console.log(request);

        return true;
    }
}
