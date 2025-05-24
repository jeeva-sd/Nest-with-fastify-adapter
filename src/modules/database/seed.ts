import { appConfig } from '~/configs';
import { seedRolesAndPermissions } from './seedRolesAndPermissions';

export async function seedDatabase() {
    const allowSeed = appConfig.database.sql.allowSeed;

    if (allowSeed) {
        await seedRolesAndPermissions();
    }
}
