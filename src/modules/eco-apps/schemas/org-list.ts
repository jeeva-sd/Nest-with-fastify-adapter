import { z } from 'zod';

export const OrganizationListDto = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().max(50).default(10),
    searchTerm: z.string().trim().optional()
});

export type OrganizationListDto = z.infer<typeof OrganizationListDto>;
