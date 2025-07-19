import { z } from 'zod/v4';

export const DepartmentSyncDto = z.object({
    userId: z.string().nonempty(),
    departmentInfo: z
        .array(
            z.object({
                departmentId: z.coerce.number(),
                title: z.string().nullable().optional(),
                supervisorIds: z.array(z.string()).optional().nullable().default([])
            })
        )
        .optional()
});

export type DepartmentSyncDto = z.infer<typeof DepartmentSyncDto>;
