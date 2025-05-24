import { z } from 'zod';
import { permissions } from '~/configs';

const validPermissionKeys = Object.keys(permissions).map(key => key.toLowerCase()) as [string, ...string[]];

export const UpdateRoleDto = z.object({
    roleId: z.string().cuid(),
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    permissions: z.array(z.enum(validPermissionKeys)).default([])
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleDto>;
