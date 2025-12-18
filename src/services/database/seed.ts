import { Logger } from '@nestjs/common';
import { appConfig } from '~/configs/config.reader';
import { seedRolesAndPermissions } from './seedRoles';

export async function seedDatabase() {
    const logger = new Logger('DatabaseSeeder');
    const allowSeed = appConfig.database.sql.allowSeed;

    if (allowSeed) {
        logger.log('Seeding database...');
        await Promise.all([seedRolesAndPermissions()]);
        logger.debug('Seeding completed successfully.');
    } else {
        logger.debug('Seeding is not allowed.');
    }
}
