import { z } from 'zod';

export const LeaveRequestNotifySupervisorsDto = z.object({
    leaveRequestId: z.string()
});

export type LeaveRequestNotifySupervisorsDto = z.infer<typeof LeaveRequestNotifySupervisorsDto>;
