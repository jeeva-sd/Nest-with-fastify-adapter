import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { RequestX } from '~/common';
import { appConfig } from '~/configs';
import { EcoAppsService } from '~/modules/eco-apps/eco-apps.service';
import { PortalLoginResponse } from '~/modules/eco-apps/types/portal-responses';
import { RoleService } from '~/modules/roles/role.service';
import { PortalCookieDto } from '../schemas/portal-cookie-values';

@Injectable()
export class PortalCookieAuthStrategy extends PassportStrategy(Strategy, 'portal-cookie') {
    constructor(
        private roleService: RoleService,
        private ecoAppService: EcoAppsService
    ) {
        super();
    }

    async validate(request: RequestX) {
        const cookieName = appConfig.ecoApps.portal.tokenCookieName;
        let portalToken: string | undefined;

        // Extract portal token from cookies or authorization header
        if (request?.cookies?.[cookieName]) portalToken = request.cookies[cookieName];
        else {
            const authHeader = request?.headers?.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                portalToken = authHeader.substring(7);
            }
        }

        // Validate portal token
        if (!portalToken) {
            throw new UnauthorizedException('Portal token is missing in cookies or authorization header.');
        }

        let portalResponse: PortalLoginResponse;
        try {
            portalResponse = await this.ecoAppService.validatePortalCookie(cookieName, portalToken);
        } catch (_error) {
            throw new UnauthorizedException('Token validation failed in the portal service.');
        }

        // Manage role permissions
        const roleId: string = this.roleService.getRoleIdFromPortalRoleType(portalResponse.roleType);

        try {
            // Add user data to request
            request.payload = PortalCookieDto.parse({
                ...portalResponse,
                ...(request?.body && typeof request.body === 'object' ? request.body : {}),
                roleId
            });
        } catch (err) {
            const validationErrors = err.errors?.map(e => e.message).join(', ') || 'Unknown validation error';
            throw new BadRequestException(`Payload validation failed: ${validationErrors}`);
        }

        return true;
    }
}
