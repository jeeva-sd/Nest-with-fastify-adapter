import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { PermissionName } from './role.constants';
import { RoleService } from './role.service';

const PERMISSION_SCHEMA_VERSION = '1.0';

@Injectable()
export class PermissionCacheService {
    private cache: LRUCache<string, PermissionName[]>;

    constructor(private readonly roleService: RoleService) {
        this.cache = new LRUCache<string, PermissionName[]>({
            max: 1000, // max entries
            ttl: 1000 * 60 * 60 // 1 hour TTL
        });
    }

    async getPermissions(accessId: string, roleId: string): Promise<PermissionName[]> {
        let permissions = this.cache.get(accessId);
        if (!permissions) {
            permissions = await this.roleService.getPermissions(roleId);
            this.cache.set(accessId, permissions);
        }
        return permissions;
    }

    generateAccessId(orgId: string, roleId: string, permissionRevisions: number): string {
        const revisionParts = `${roleId}:${permissionRevisions || 0}`;
        const input = `${orgId}|${roleId}|${revisionParts}|${PERMISSION_SCHEMA_VERSION}`;
        return createHash('sha1').update(input).digest('hex').slice(0, 8);
    }

    async clearCache(accessId: string): Promise<void> {
        this.cache.delete(accessId);
    }

    async clearAllCache(): Promise<void> {
        this.cache.clear();
    }
}
