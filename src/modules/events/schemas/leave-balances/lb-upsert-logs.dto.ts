import * as z from 'zod';

export const LeaveBalanceUpdatedDto = z.object({
    userId: z.string().min(1, 'userId is required'),
    transactionLogs: z.array(z.string())
});

export type LeaveBalanceUpdatedDto = z.infer<typeof LeaveBalanceUpdatedDto>;
