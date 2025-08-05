import { z } from 'zod/v4';

export const LeaveRequestNotifySupervisorsDto = z.object({
    leaveRequestId: z.string()
});

export type LeaveRequestNotifySupervisorsDto = z.infer<typeof LeaveRequestNotifySupervisorsDto>;
