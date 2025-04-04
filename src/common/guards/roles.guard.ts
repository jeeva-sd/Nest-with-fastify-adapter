import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from 'src/configs';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get(appConfig.auth.roleKey, context.getHandler());
        if (!roles) return true;
        // Write down the role validations here 🚨

        return true;
    }
}
