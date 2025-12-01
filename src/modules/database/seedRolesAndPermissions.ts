import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { appConfig, permissions, standardRoles } from '~/configs';

const { sql } = appConfig.database;

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `mysql://${sql.username}:${sql.password}@${sql.host}:${sql.port}/${sql.database}?connection_limit=${sql.connectionLimit}&pool_timeout=${sql.performance.poolTimeout}&socket_timeout=${sql.performance.socketTimeout}&connect_timeout=${sql.performance.connectTimeout}&sslmode=PREFERRED&query_timeout=${sql.performance.queryTimeout}`;
}

const prisma = new PrismaClient({
    log: [
        // Environment-aware logging configuration
        ...(appConfig.server.mode === 'development'
            ? [
                { emit: 'event', level: 'query' }, // Log all queries in development
                { emit: 'event', level: 'info' }, // Log info messages in development
                { emit: 'event', level: 'warn' } // Log warnings in development
            ]
            : []),
        { emit: 'event', level: 'error' } // Always log errors regardless of environment
    ] as any[],
    errorFormat: appConfig.server.mode === 'development' ? 'pretty' : 'minimal' // Pretty errors in dev, minimal in prod
});

const logger = new Logger('seedRolesAndPermissions');

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

            logger.log('Seeded roles, permissions, and role-permission mappings.');
        },
        {
            timeout: 30000 // 30 seconds
        }
    );

    await prisma.$disconnect();
}
