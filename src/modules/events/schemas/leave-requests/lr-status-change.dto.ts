import * as z from 'zod/v4';

export const LeaveRequestStatusChangedDto = z.object({
    leaveRequestId: z.string().min(1, 'leaveRequestId is required'),
    status: z.string().min(1, 'status is required')
});

export type LeaveRequestStatusChangedDto = z.infer<typeof LeaveRequestStatusChangedDto>;
