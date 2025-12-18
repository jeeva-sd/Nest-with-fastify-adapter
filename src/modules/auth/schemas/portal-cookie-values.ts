import { z } from 'zod';
import { PortalRoleType } from '~/modules/eco-apps/types/portal-roles';

export const PortalCookieDto = z.object({
    sub: z.email().trim(),
    userId: z.string().trim(),
    fname: z.string().trim(),
    lname: z.string().trim(),
    oid: z.string().trim(),
    roleId: z.string().trim().optional(),
    profileImage: z.boolean().default(false),
    timezone: z.string().nullable(),
    title: z.string().trim().nullable(),
    phone: z.string().trim().nullable(),
    country: z.string().trim().nullable(),
    exp: z.coerce.number(),
    departmentId: z.coerce.number().nullable(),
    bio: z.string().trim().nullable(),
    status: z.coerce.number().nullable(),
    roleType: z.enum([PortalRoleType.ORG_ADMIN, PortalRoleType.STANDARD_USER, PortalRoleType.SUPER_ADMIN]).nullable(),
    departments: z
        .array(
            z.object({
                id: z.coerce.number(),
                name: z.string(),
                title: z.string().nullable(),
                supervisors: z
                    .array(
                        z.object({
                            id: z.string(),
                            name: z.string()
                        })
                    )
                    .optional()
            })
        )
        .optional()
    // Uncomment if needed:
    // iat: z.number().int(),
    // roleName: z.string().trim(),
    // oname: z.string(),
    // name: z.string(),
});

export type PortalCookieDto = z.infer<typeof PortalCookieDto>;
