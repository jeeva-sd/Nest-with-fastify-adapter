import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CustomJwtModule } from '../jwt/jwt.module';

@Module({
    imports: [CustomJwtModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
