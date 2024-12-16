import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as yup from 'yup';

@Injectable()
export class PayloadGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Retrieve schema from route handler metadata
        const schema = this.reflector.get<yup.ObjectSchema<any>>('schema', context.getHandler());

        if (!schema) {
            // If no schema is found, skip validation
            return true;
        }

        // Validate request body against the schema
        try {
            await schema.validate(request.body);
        } catch (error) {
            // If validation fails, throw an error (you can customize this to handle errors better)
            throw new BadRequestException(error.message);
        }

        return true;
    }
}
