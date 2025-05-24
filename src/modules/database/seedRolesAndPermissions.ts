import { PrismaClient } from '@prisma/client';
import { permissions, standardRoles } from '~/configs';

const prisma = new PrismaClient();

export async function seedRolesAndPermissions() {
    await prisma.$transaction(async tx => {
        // Upsert permissions
        const permissionData = Object.values(permissions).map(permission => ({
            id: permission.id,
            name: permission.name
        }));

        await tx.permissions.createMany({
            data: permissionData,
            skipDuplicates: true // Avoids errors for existing records
        });

        // Upsert roles
        const roleData = Object.values(standardRoles).map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            isCustom: role.isCustom
        }));

        await tx.roles.createMany({
            data: roleData,
            skipDuplicates: true // Avoids errors for existing records
        });

        // Fetch all roles and permissions to map IDs
        const allRoles = await tx.roles.findMany({
            where: { id: { in: roleData.map(role => role.id) } }
        });

        const allPermissions = await tx.permissions.findMany({
            where: { id: { in: permissionData.map(permission => permission.id) } }
        });

        // Prepare role-permissions data
        const rolePermissionsData = Object.values(standardRoles).flatMap(role => {
            const roleRecord = allRoles.find(r => r.id === role.id);
            return role.permissions
                .map(permission => {
                    const permissionRecord = allPermissions.find(p => p.id === permission.id);
                    return roleRecord && permissionRecord
                        ? { roleId: roleRecord.id, permissionId: permissionRecord.id }
                        : null;
                })
                .filter(Boolean); // Remove null values
        });

        // Upsert role-permissions
        await tx.rolePermissions.createMany({
            data: rolePermissionsData as { roleId: string; permissionId: string }[],
            skipDuplicates: true // Avoids errors for existing records
        });
    });
}
