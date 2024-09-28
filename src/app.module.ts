import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { Chalk } from './utils';

@Module({
    imports: [UserModule, AuthModule],
    controllers: [],
    providers: [Chalk],
    exports: [Chalk]
})
export class AppModule {}
