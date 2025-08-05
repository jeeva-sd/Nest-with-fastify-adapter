import { z } from 'zod/v4';
import { FileTypes, createFileRule } from '~/common';

export const ProfileImageDto = z.object({
    profileImage: createFileRule({
        required: true,
        allowedMimeTypes: [FileTypes.IMAGE_PNG],
        fieldName: 'profileImage',
        includeBuffer: true,
        maxFileSize: 3, // 5 MB
        minFileSize: 0.1 // 1 MB
    })
});

export type ProfileImageDto = z.infer<typeof ProfileImageDto>;
