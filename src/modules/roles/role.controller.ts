import { Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RequestX, Sanitize } from '~/common';
import { RoleGuard } from './guards/role.guard';
import { ACL } from './guards/role.policies';
import { Access } from './role.decorators';
import { RoleService } from './role.service';
import { CreateRoleDto, DeleteRolesDto, ListRolesDto, UpdateRoleDto, ViewRoleDto } from './schemas';

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    @Sanitize(ListRolesDto)
    async getFile(@Req() req: RequestX) {
        return this.roleService.listRoles(req.payload as ListRolesDto);
    }

    @Post()
    @UseGuards(RoleGuard)
    @Sanitize(CreateRoleDto)
    @Access(ACL.superAdminOnly)
    async createRole(@Req() req: RequestX) {
        return this.roleService.createRole(req.payload as CreateRoleDto);
    }

    @Patch()
    @UseGuards(RoleGuard)
    @Sanitize(UpdateRoleDto)
    @Access(ACL.superAdminOnly)
    async updateRole(@Req() req: RequestX) {
        return this.roleService.updateRole(req.payload as UpdateRoleDto);
    }

    @Delete()
    @UseGuards(RoleGuard)
    @Sanitize(DeleteRolesDto)
    @Access(ACL.superAdminOnly)
    async deleteRoles(@Req() req: RequestX) {
        return this.roleService.deleteRole(req.payload as DeleteRolesDto);
    }

    @Get('permissions')
    async getAllPermissions() {
        return this.roleService.getAllPermissionsInfos();
    }

    @Get(':roleId')
    @Sanitize(ViewRoleDto)
    async getRoleById(@Req() req: RequestX, @Param('roleId') roleId: string) {
        return this.roleService.getRoleById(roleId, req.payload as ViewRoleDto);
    }
}
