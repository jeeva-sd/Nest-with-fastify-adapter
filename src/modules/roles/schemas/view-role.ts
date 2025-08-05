import { z } from 'zod/v4';

export const ViewRoleDto = z.object({
    roleId: z.string().cuid(),
    includePermissions: z
        .any()
        .transform(value => value === true || value === 'true')
        .default(false)
});

export type ViewRoleDto = z.infer<typeof ViewRoleDto>;
