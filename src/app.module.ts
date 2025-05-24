import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { JwtAuthGuard, LocalAuthGuard, StrategyModule } from '~/common';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/roles/roles.module';

@Module({
    imports: [
        AuthModule,
        StrategyModule,
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true }
        }),
        RoleModule
    ],
    controllers: [],
    providers: [LocalAuthGuard, JwtAuthGuard]
})
export class AppModule {}
