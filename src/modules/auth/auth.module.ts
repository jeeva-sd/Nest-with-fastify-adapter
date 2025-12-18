import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { RoleModule } from '../roles/role.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PermissionCacheService } from '../roles/permission-cache.service';
import { StrategyModule } from './strategies/strategy.module';

@Module({
    imports: [StrategyModule, EventsModule, RoleModule],
    controllers: [AuthController],
    providers: [AuthService, PermissionCacheService]
})
export class AuthModule {}
