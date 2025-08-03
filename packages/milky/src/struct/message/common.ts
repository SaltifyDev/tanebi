import z from 'zod';

export const zMessageScene = z.enum(['friend', 'group', 'temp']);