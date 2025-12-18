import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { RequestX, Sanitize } from '~/common';
import { JwtAuthGuard } from '../auth/guards';
import { ACL, Access, RoleGuard } from '../roles';
import { EcoAppsService } from './eco-apps.service';
import { CountryListDto, FindOrgDto, OrganizationListDto, TimezoneDto } from './schemas';

@Controller('eco-apps')
@UseGuards(JwtAuthGuard)
export class EcoAppsController {
    constructor(private readonly ecoAppService: EcoAppsService) {}

    // -------------------------------------------- Portal --------------------------------------------

    // @HttpCode(200)
    // @Post('user-update-webhook')
    // @Sanitize(UserUpdateHookDto)
    // @SkipJwtAuth()
    // @UseGuards(PortalBasicAuthGuard)
    // async userProfile(@Request() req: RequestX) {
    //     if (appConfig.server.mode !== 'production') {
    //         console.log(JSON.stringify(req.payload, null, 2), 'user-update-webhook');
    //     }

    //     return this.ecoAppService.syncLocalUser(req.payload);
    // }

    @Get('timezone/list')
    @Sanitize(TimezoneDto)
    async timezoneList(@Request() req: RequestX) {
        return this.ecoAppService.findAllTimezones(req.payload as TimezoneDto);
    }

    @Get('country/list')
    @Sanitize(CountryListDto)
    async countryList(@Request() req: RequestX) {
        return this.ecoAppService.findAllCountries(req.payload as CountryListDto);
    }

    @Get('organization/:organizationId')
    @Sanitize(FindOrgDto)
    async findOrganization(@Request() req: RequestX) {
        const payload = req.payload as FindOrgDto;
        return this.ecoAppService.findOrganization(payload.organizationId);
    }

    @Get('organization/list')
    @UseGuards(RoleGuard)
    @Sanitize(OrganizationListDto)
    @Access(ACL.switchOrganizations)
    async findAllOrganizations(@Request() req: RequestX) {
        return this.ecoAppService.findAllOrganization(req.payload as OrganizationListDto);
    }
}
