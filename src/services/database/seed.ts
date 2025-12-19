import { Logger } from '@nestjs/common';
import { appConfig } from '~/configs';
import { PrismaService } from './prisma.service';
import { seedRolesAndPermissions } from './seedRoles';

export async function seedDatabase(prisma: PrismaService) {
    const logger = new Logger('DatabaseSeeder');
    const allowSeed = appConfig.database.sql.allowSeed;

    if (allowSeed) {
        logger.log('Seeding database...');
        await Promise.all([seedRolesAndPermissions(prisma)]);
        logger.debug('Seeding completed successfully.');
    } else {
        logger.debug('Seeding is not allowed.');
    }
}
