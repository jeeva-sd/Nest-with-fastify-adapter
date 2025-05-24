import { Controller, Delete, Get, Patch, Post, Req } from '@nestjs/common';
import { Access, RequestX, Sanitize } from '~/common';
import { ACL } from './access-policies';
import { RoleService } from './roles.service';
import { CreateRoleDto, DeleteRolesDto, ListRolesDto, UpdateRoleDto, ViewRoleDto } from './schemas';

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RoleService) {}

    @Get('view')
    @Sanitize(ViewRoleDto)
    async getRoleById(@Req() req: RequestX) {
        return this.roleService.getRoleById(req.payload);
    }

    @Get()
    @Sanitize(ListRolesDto)
    async getFile(@Req() req: RequestX) {
        return this.roleService.listRoles(req.payload);
    }

    @Post()
    @Sanitize(CreateRoleDto)
    @Access(ACL.superAdminOnly)
    async createRole(@Req() req: RequestX) {
        return this.roleService.createRole(req.payload);
    }

    @Patch()
    @Sanitize(UpdateRoleDto)
    @Access(ACL.superAdminOnly)
    async updateRole(@Req() req: RequestX) {
        return this.roleService.updateRole(req.payload);
    }

    @Delete()
    @Sanitize(DeleteRolesDto)
    @Access(ACL.superAdminOnly)
    async deleteRoles(@Req() req: RequestX) {
        return this.roleService.deleteRole(req.payload);
    }

    @Get('permissions')
    async getAllPermissions() {
        return this.roleService.getAllPermissions();
    }
}
