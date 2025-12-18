import { Controller, Get, HttpCode, Post, Request, Response, UseGuards } from '@nestjs/common';
import { RequestX, ResponseX, Sanitize } from '~/common';
import { appConfig } from '~/configs';
import { ACL, Access, RoleGuard } from '../roles';
import { AuthService } from './auth.service';
import { ImpersonationGuard, JwtAuthGuard, PortalCookieAuthGuard } from './guards';
import { ImpersonateUserDto, PortalCookieDto } from './schemas';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @Post('check-login')
    @UseGuards(PortalCookieAuthGuard)
    async checkLogin(@Request() req: RequestX) {
        return this.authService.checkLogin(req.payload as PortalCookieDto);
    }

    @Get('test')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Access(ACL.superAdminOr)
    async testAuthGuard() {
        return { message: 'Auth guard working fine' };
    }

    @HttpCode(200)
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logoutUser(@Response() res: ResponseX) {
        const { tokenCookieName, domainForCookie } = appConfig.ecoApps.portal;
        res.clearCookie(tokenCookieName, { domain: domainForCookie });
        res.send({ message: 'Logged out successfully' });
    }

    @Get('impersonate')
    @Access(ACL.manageUsers)
    @Sanitize(ImpersonateUserDto)
    @UseGuards(JwtAuthGuard, RoleGuard, ImpersonationGuard)
    async impersonate() {
        return this.authService.impersonate();
    }
}
