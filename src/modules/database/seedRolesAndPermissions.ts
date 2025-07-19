import { PrismaClient } from '@prisma/client';
import { Chalk } from '~/common';
import { permissions, standardRoles } from '~/configs';

const prisma = new PrismaClient();
const chalk = new Chalk('seedRolesAndPermissions');

export async function seedRolesAndPermissions() {
    await prisma.$transaction(
        async tx => {
            // 1. Upsert Permissions and Roles in parallel
            const permissionData = Object.values(permissions).map(permission => ({
                id: permission.id,
                name: permission.name,
                description: permission.description
            }));

            const roleData = Object.values(standardRoles).map(role => ({
                id: role.id,
                name: role.name,
                description: role.description
            }));

            await Promise.all([
                // Upsert all permissions in parallel
                Promise.all(
                    permissionData.map(permission =>
                        tx.permission.upsert({
                            where: { id: permission.id },
                            update: {
                                name: permission.name,
                                description: permission.description
                            },
                            create: permission
                        })
                    )
                ),
                // Upsert all roles in parallel
                Promise.all(
                    roleData.map(role =>
                        tx.role.upsert({
                            where: { id: role.id },
                            update: {
                                name: role.name,
                                description: role.description
                            },
                            create: role
                        })
                    )
                )
            ]);

            // 2. Fetch all roles and permissions in parallel (to ensure DB consistency for IDs)
            const [allRoles, allPermissions] = await Promise.all([
                tx.role.findMany({
                    where: { id: { in: roleData.map(role => role.id) } }
                }),
                tx.permission.findMany({
                    where: { id: { in: permissionData.map(p => p.id) } }
                })
            ]);

            // 3. Map role-permission relations
            const rolePermissionsData = Object.values(standardRoles).flatMap(role => {
                const roleRecord = allRoles.find(r => r.id === role.id);
                return role.permissions
                    .map(permission => {
                        const permissionRecord = allPermissions.find(p => p.id === permission.id);
                        return roleRecord && permissionRecord
                            ? { roleId: roleRecord.id, permissionId: permissionRecord.id }
                            : null;
                    })
                    .filter(Boolean);
            });

            // 4. Insert Role-Permissions
            await tx.rolePermission.createMany({
                data: rolePermissionsData as { roleId: string; permissionId: string }[],
                skipDuplicates: true
            });

            chalk.success('Seeded roles, permissions, and role-permission mappings.');
        },
        {
            timeout: 30000 // 30 seconds
        }
    );
}
