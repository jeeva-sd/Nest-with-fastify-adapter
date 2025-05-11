import { z } from 'zod';

export const userCreatedMessage = z.object({
    userId: z.number({ required_error: 'User ID is required' }),
    points: z.number({ required_error: 'Points are required' }).min(10, { message: 'Points must be at least 10' })
});

export type UserCreatedMessage = z.infer<typeof userCreatedMessage>;
