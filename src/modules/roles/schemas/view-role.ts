import { z } from 'zod';

export const ViewRoleDto = z.object({
    includePermissions: z
        .any()
        .transform(value => value === true || value === 'true')
        .default(false)
});

export type ViewRoleDto = z.infer<typeof ViewRoleDto>;
