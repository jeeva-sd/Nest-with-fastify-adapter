import { z } from 'zod';

export const FindOrgDto = z.object({
    organizationId: z.string()
});

export type FindOrgDto = z.infer<typeof FindOrgDto>;
