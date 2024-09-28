import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { adminRoleCacheKey, standardRoles, superAdminRoleCacheKey } from 'src/constants/roleData';

@Injectable()
export class RoleService {
    private cache = new NodeCache({ stdTTL: 600 }); // 10 Mins
    constructor() {}

    async getSuperAdminIds(): Promise<string[]> {
        const cachedSuperAdminIds = this.cache.get<string[]>(superAdminRoleCacheKey);
        if (cachedSuperAdminIds) return cachedSuperAdminIds;

        const superAdminIds = [standardRoles.superAdmin.id];
        this.cache.set(superAdminRoleCacheKey, superAdminIds);
        return superAdminIds;
    }

    async getAdminIds(): Promise<string[]> {
        const cachedAdminIds = this.cache.get<string[]>(adminRoleCacheKey);
        if (cachedAdminIds) return cachedAdminIds;

        const adminIds = [standardRoles.superAdmin.id];
        this.cache.set(superAdminRoleCacheKey, adminIds);
        return adminIds;
    }

    async getModifyRecordIds(): Promise<string[]> {
        const cachedAdminIds = this.cache.get<string[]>(adminRoleCacheKey);
        if (cachedAdminIds) return cachedAdminIds;

        const adminIds = [standardRoles.superAdmin.id];
        this.cache.set(superAdminRoleCacheKey, adminIds);
        return adminIds;
    }

    // private invalidateCache() {
    //     this.cache.del(superAdminRoleCacheKey); // call this on role updates to reset cache data
    //     this.cache.del(adminRoleCacheKey);
    // }
}
