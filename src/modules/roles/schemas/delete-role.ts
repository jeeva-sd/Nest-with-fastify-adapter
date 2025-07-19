import { z } from 'zod/v4';

export const DeleteRolesDto = z.object({
    roleId: z.string().cuid()
});

export type DeleteRolesDto = z.infer<typeof DeleteRolesDto>;
