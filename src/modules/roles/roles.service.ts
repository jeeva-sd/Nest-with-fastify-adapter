import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '~/modules/database';
import { CreateRoleDto, DeleteRolesDto, ListRolesDto, UpdateRoleDto, ViewRoleDto } from './schemas';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) {}

    async getRoleById(dto: ViewRoleDto) {
        const { roleId, includePermissions = false } = dto;

        const role = await this.prisma.roles.findUnique({
            where: { id: roleId },
            include: includePermissions ? { rolePermissions: { include: { permission: true } } } : undefined
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            isCustom: role.isCustom,
            permissions: includePermissions ? role.rolePermissions.map(rp => rp.permission.name) : undefined
        };
    }

    async listRoles(dto: ListRolesDto) {
        const { searchTerm, sortBy, sortOrder, page, limit, includePermissions = false } = dto;

        const where: Prisma.RolesWhereInput = searchTerm ? { name: { contains: searchTerm } } : {};

        const [items, total] = await Promise.all([
            this.prisma.roles.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { [sortBy]: sortOrder },
                include: includePermissions ? { rolePermissions: { include: { permission: true } } } : undefined
            }),
            this.prisma.roles.count({ where })
        ]);

        const roles = items.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            isCustom: role.isCustom,
            permissions: includePermissions ? role.rolePermissions.map(e => e.permission.name) : undefined
        }));

        return { total, roles };
    }

    async createRole(dto: CreateRoleDto) {
        const { name, description, permissions: permissionNames } = dto;

        // Check for duplicate role name
        const existingRole = await this.prisma.roles.findFirst({ where: { name } });
        if (existingRole) {
            throw new BadRequestException('Role with this name already exists');
        }

        // Create the role
        const newRole = await this.prisma.roles.create({
            data: { name, description, isCustom: true }
        });

        // Attach permissions by name (lookup IDs)
        if (permissionNames.length > 0) {
            const permissions = await this.prisma.permissions.findMany({
                where: { name: { in: permissionNames } }
            });

            if (permissions.length !== permissionNames.length) {
                throw new BadRequestException('One or more permissions are invalid');
            }

            await this.prisma.rolePermissions.createMany({
                data: permissions.map(perm => ({
                    roleId: newRole.id,
                    permissionId: perm.id
                }))
            });
        }

        return {
            id: newRole.id,
            name: newRole.name,
            description: newRole.description,
            isCustom: newRole.isCustom,
            permissions: permissionNames
        };
    }

    async updateRole(dto: UpdateRoleDto) {
        const { roleId: id, name, description, permissions: permissionNames } = dto;

        return this.prisma.$transaction(async tx => {
            // Fetch role and ensure it's custom
            const existingRole = await tx.roles.findUnique({ where: { id } });

            if (!existingRole) {
                throw new NotFoundException('Role not found');
            }

            if (!existingRole.isCustom) {
                throw new BadRequestException('Only custom roles can be edited');
            }

            // Check for duplicate name if a new one is provided
            if (name && name !== existingRole.name) {
                const nameTaken = await tx.roles.findFirst({
                    where: { name, id: { not: id } }
                });

                if (nameTaken) {
                    throw new BadRequestException('Another role with this name already exists');
                }
            }

            // Update the role
            const updatedRole = await tx.roles.update({
                where: { id },
                data: {
                    name: name ?? existingRole.name,
                    description: description ?? existingRole.description
                }
            });

            // Update permissions if provided
            if (permissionNames) {
                const permissions = await tx.permissions.findMany({
                    where: { name: { in: permissionNames } }
                });

                if (permissions.length !== permissionNames.length) {
                    throw new BadRequestException('One or more permissions are invalid');
                }

                // Remove all existing permissions
                await tx.rolePermissions.deleteMany({ where: { roleId: id } });

                // Add new permissions
                await tx.rolePermissions.createMany({
                    data: permissions.map(perm => ({ roleId: id, permissionId: perm.id }))
                });
            }

            return {
                id: updatedRole.id,
                name: updatedRole.name,
                description: updatedRole.description,
                isCustom: updatedRole.isCustom,
                permissions: permissionNames ?? undefined
            };
        });
    }

    async deleteRole({ roleId }: DeleteRolesDto) {
        return this.prisma.$transaction(async tx => {
            // Fetch the role to validate
            const role = await tx.roles.findUnique({
                where: { id: roleId },
                include: { users: true } // Include associated users
            });

            if (!role) {
                throw new NotFoundException('Role not found');
            }

            // Ensure the role is custom
            if (!role.isCustom) {
                throw new BadRequestException('Only custom roles can be deleted');
            }

            // Check if there are any users associated with the role
            const userCount = role.users.length;
            if (userCount > 0) {
                throw new BadRequestException(
                    `Cannot delete role. ${userCount} user(s) are associated with this role.`
                );
            }

            // Delete the role
            await tx.roles.delete({
                where: { id: roleId }
            });

            return { deleted: true };
        });
    }

    async getAllPermissions() {
        const permissions = await this.prisma.permissions.findMany({
            orderBy: { name: 'asc' }
        });

        return permissions.map(p => p.name);
    }
}
