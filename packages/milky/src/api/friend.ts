import { defineApi, Failed, Ok } from '@/api';
import z from 'zod';

export const SendFriendNudge = defineApi(
    'send_friend_nudge',
    z.object({
        user_id: z.number().int().positive(),
        is_self: z.boolean().default(false),
    }),
    async (app, payload) => {
        const friend = await app.bot.getFriend(payload.user_id);
        if (!friend) return Failed(-404, 'Friend not found');
        await friend.sendNudge(payload.is_self);
        return Ok();
    }
);

export const SendProfileLike = defineApi(
    'send_profile_like',
    z.object({
        user_id: z.number().int().positive(),
        count: z.number().int().min(1).default(1),
    }),
    async (app, payload) => {
        await app.bot.sendProfileLike(payload.user_id, payload.count);
        return Ok();
    }
);

export const FriendApi = [
    SendFriendNudge,
    SendProfileLike,
];


