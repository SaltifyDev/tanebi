import { defineApi, Failed, Ok } from '@/common/api';
import { transformFriendRequest } from '@/transform/notification';
import {
    AcceptFriendRequestInput,
    GetFriendRequestsInput,
    GetFriendRequestsOutput,
    RejectFriendRequestInput,
    SendFriendNudgeInput,
    SendProfileLikeInput,
} from '@saltify/milky-types';
import z from 'zod';

export const SendFriendNudge = defineApi(
    'send_friend_nudge',
    SendFriendNudgeInput,
    z.object(),
    async (app, payload) => {
        const friend = await app.bot.getFriend(payload.user_id);
        if (!friend) return Failed(-404, 'Friend not found');
        await friend.sendNudge(payload.is_self);
        return Ok({});
    }
);

export const SendProfileLike = defineApi(
    'send_profile_like',
    SendProfileLikeInput,
    z.object(),
    async (app, payload) => {
        await app.bot.sendProfileLike(payload.user_id, payload.count);
        return Ok({});
    }
);

export const GetFriendRequests = defineApi(
    'get_friend_requests',
    GetFriendRequestsInput,
    GetFriendRequestsOutput,
    async (app, payload) => {
        const requests = await app.bot.getFriendRequests(payload.is_filtered, payload.limit);
        return Ok({
            requests: requests.map(transformFriendRequest),
        });
    }
);

export const AcceptFriendRequest = defineApi(
    'accept_friend_request',
    AcceptFriendRequestInput,
    z.object(),
    async (app, payload) => {
        await app.bot.handleFriendRequest(payload.initiator_uid, payload.is_filtered, true);
        return Ok({});
    }
);

export const RejectFriendRequest = defineApi(
    'reject_friend_request',
    RejectFriendRequestInput,
    z.object(),
    async (app, payload) => {
        await app.bot.handleFriendRequest(payload.initiator_uid, payload.is_filtered, false);
        return Ok({});
    }
);

export const FriendApi = [
    SendFriendNudge,
    SendProfileLike,
    GetFriendRequests,
    AcceptFriendRequest,
    RejectFriendRequest,
];
