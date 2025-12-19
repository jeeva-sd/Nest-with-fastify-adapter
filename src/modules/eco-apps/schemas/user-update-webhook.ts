import { z } from 'zod';
import { PortalRoleType } from '../types/portal-roles';
import { profileImageRule } from './profile-image';

export const UserUpdateHookDto = z.object({
    userId: z.string().optional(),
    fname: z.string().optional(),
    lname: z.string().optional(),
    bio: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    timezone: z.string().optional(),
    roleType: z.enum(Object.values(PortalRoleType) as [PortalRoleType, ...PortalRoleType[]]).optional(),
    profileImage: z.boolean().optional(),
    profileImageBuffer: profileImageRule,
    roleId: z.string().optional(), // set in service layer
    departmentInfo: z
        .array(
            z.object({
                departmentId: z.coerce.number(),
                title: z.string().nullable().optional(),
                supervisorIds: z.array(z.string()).nullable().optional().default([])
            })
        )
        .optional()
});

export type UserUpdateHookDto = z.infer<typeof UserUpdateHookDto>;
