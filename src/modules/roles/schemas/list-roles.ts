import { z } from 'zod';

export const ListRolesDto = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(5),
    searchTerm: z.string().max(20).optional(),
    sortBy: z.enum(['name', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    includePermissions: z
        .any()
        .transform(value => value === true || value === 'true')
        .optional()
});

export type ListRolesDto = z.infer<typeof ListRolesDto>;
