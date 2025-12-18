import { z } from 'zod';

export const CountryListDto = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(50)
});

export type CountryListDto = z.infer<typeof CountryListDto>;
