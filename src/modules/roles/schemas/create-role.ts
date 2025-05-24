import { z } from 'zod';
import { permissions } from '~/configs/role.config';

// Extract valid permission keys dynamically
const validPermissionKeys = Object.keys(permissions).map(key => key.toLowerCase()) as [string, ...string[]];

export const CreateRoleDto = z.object({
    name: z.string().min(1),
    description: z.string().max(255).optional().nullable(),
    permissions: z.array(z.enum(validPermissionKeys)).optional().default([])
});

export type CreateRoleDto = z.infer<typeof CreateRoleDto>;
