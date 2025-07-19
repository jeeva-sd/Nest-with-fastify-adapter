import { z } from 'zod/v4';

export const userCreatedMessage = z.object({
    userId: z.number(),
    points: z.number().min(10, { message: 'Points must be at least 10' })
});

export type UserCreatedMessage = z.infer<typeof userCreatedMessage>;
