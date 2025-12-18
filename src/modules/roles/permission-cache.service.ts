import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';
import { createHash } from 'node:crypto';
import { RoleService } from './role.service';
import { PermissionName } from './role.constants';

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

    async getPermissions(permVer: string, roleIds: string[]): Promise<PermissionName[]> {
        let permissions = this.cache.get(permVer);
        if (!permissions) {
            permissions = await this.roleService.getPermissions(roleIds);
            this.cache.set(permVer, permissions);
        }
        return permissions;
    }

    generatePermissionVersion(
        orgId: string,
        roleIds: string[],
        permissionRevisions: Record<string, number>
    ): string {
        const sortedRoleIds = [...roleIds].sort();
        const revisionParts = sortedRoleIds.map(roleId => `${roleId}:${permissionRevisions[roleId] || 0}`);
        const input = `${orgId}|${sortedRoleIds.join(',')}|${revisionParts.join(',')}|${PERMISSION_SCHEMA_VERSION}`;
        return createHash('sha1').update(input).digest('hex').slice(0, 8);
    }
}
