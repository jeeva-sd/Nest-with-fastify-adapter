import { z } from 'zod';

export const ImpersonateUserDto = z.object({
    userId: z.string().trim().nonempty()
});

export type ImpersonateUserDto = z.infer<typeof ImpersonateUserDto>;
