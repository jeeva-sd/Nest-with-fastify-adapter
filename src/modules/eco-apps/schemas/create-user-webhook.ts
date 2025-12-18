import { z } from 'zod';
import { PortalRoleType } from '../types/portal-roles';

export const CreateUserHookDto = z.object({
    email: z.string().trim().email().max(255),
    fname: z.string().trim().max(50),
    lname: z.string().trim().max(50),
    organizationId: z.string().trim().max(100),
    bio: z.string().max(300).trim().nullable(),
    phone: z.string().max(20).trim().nullable(),
    country: z.string().max(100).trim().nullable(),
    roleType: z.enum(Object.values(PortalRoleType) as [PortalRoleType, ...PortalRoleType[]]).optional()
});

export type CreateUserHookDto = z.infer<typeof CreateUserHookDto>;
