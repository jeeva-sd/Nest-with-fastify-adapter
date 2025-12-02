import { z } from 'zod';

export const DeleteRolesDto = z.object({
    roleId: z.string().cuid()
});

export type DeleteRolesDto = z.infer<typeof DeleteRolesDto>;
