import { z } from 'zod/v4';
import { createFileRule, FileTypes } from '~/common';

export const profileImageRule = createFileRule({
    maxFileSize: 0.2, // in MB
    minFileSize: 0.01,
    allowedMimeTypes: [FileTypes.IMAGE_PNG, FileTypes.IMAGE_WEBP, FileTypes.IMAGE_JPEG, FileTypes.IMAGE_JPG],
    required: false,
    includeBuffer: false
});

export type ProfileImageType = z.infer<typeof profileImageRule>;
