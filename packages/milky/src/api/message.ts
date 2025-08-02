import { defineApi, Failed, Ok } from '@/api';
import { zMilkyOutgoingSegment } from '@/struct/message/outgoing';
import { transformOutgoingFriendMessage, transformOutgoingGroupMessage } from '@/transform/message/outgoing';
import z from 'zod';

export const SendPrivateMessage = defineApi(
    'send_private_message',
    z.object({
        user_id: z.number().int().positive(),
        message: z.array(zMilkyOutgoingSegment),
    }),
    async (app, payload) => {
        const friend = await app.bot.getFriend(payload.user_id);
        if (!friend) {
            return Failed(-404, 'Friend not found');
        }
        const sendRef = await friend.sendMsg(async (b) => {
            await transformOutgoingFriendMessage(app, friend, b, payload.message);
        });
        return Ok({
            message_seq: sendRef.sequence,
            time: sendRef.timestamp, 
        });
    }
);

export const SendGroupMessage = defineApi(
    'send_group_message',
    z.object({
        group_id: z.number().int().positive(),
        message: z.array(zMilkyOutgoingSegment),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(-404, 'Group not found');
        }
        const sendRef = await group.sendMsg(async (b) => {
            await transformOutgoingGroupMessage(app, group, b, payload.message);
        });
        return Ok({
            message_seq: sendRef.sequence,
            time: sendRef.timestamp,
        });
    }
);

export const MessageApi = [
    SendPrivateMessage,
    SendGroupMessage,
];
