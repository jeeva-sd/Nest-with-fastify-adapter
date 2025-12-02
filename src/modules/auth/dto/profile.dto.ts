import { z } from 'zod';
import { createFileRule, FileTypes } from '~/common';

export const ProfileImageDto = z.object({
    profileImage: createFileRule({
        required: true,
        allowedMimeTypes: [FileTypes.IMAGE_PNG],
        fieldName: 'profileImage',
        includeBuffer: true,
        maxFileSize: 3, // 3 MB
        minFileSize: 0.1 // 100 kB
    })
});

export type ProfileImageDto = z.infer<typeof ProfileImageDto>;
