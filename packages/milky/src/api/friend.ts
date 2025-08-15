import { defineApi, Failed, Ok } from '@/api';
import { transformFriendRequest } from '@/transform/notification';
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

export const GetFriendRequests = defineApi(
    'get_friend_requests',
    z.object({
        is_filtered: z.boolean().default(false),
        limit: z.number().int().min(1).default(20),
    }),
    async (app, payload) => {
        const requests = await app.bot.getFriendRequests(payload.is_filtered, payload.limit);
        return Ok({
            requests: requests.map(transformFriendRequest),
        });
    },
);

export const AcceptFriendRequest = defineApi(
    'accept_friend_request',
    z.object({
        initiator_uid: z.string(),
        is_filtered: z.boolean().default(false),
    }),
    async (app, payload) => {
        await app.bot.handleFriendRequest(
            payload.initiator_uid,
            payload.is_filtered,
            true,
        );
        return Ok();
    },
);

export const RejectFriendRequest = defineApi(
    'reject_friend_request',
    z.object({
        initiator_uid: z.string(),
        is_filtered: z.boolean().default(false),
        reason: z.string().optional(),
    }),
    async (app, payload) => {
        await app.bot.handleFriendRequest(
            payload.initiator_uid,
            payload.is_filtered,
            false,
        );
        return Ok();
    },
);

export const FriendApi = [
    SendFriendNudge,
    SendProfileLike,
    GetFriendRequests,
    AcceptFriendRequest,
    RejectFriendRequest,
];
