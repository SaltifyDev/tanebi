import z from 'zod';

export const zMessageScene = z.union([
    z.literal('friend'),
    z.literal('group'),
    z.literal('temp'),
]);