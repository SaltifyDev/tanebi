import { defineApi, Failed, Ok } from '@/api';
import { zMessageScene } from '@/struct/message/common';
import { zMilkyOutgoingSegment } from '@/struct/message/outgoing';
import { transformDanglingIncomingGroupMessage, transformIncomingForwardedMessage, transformIncomingFriendMessage, transformIncomingGroupMessage } from '@/transform/message/incoming';
import { transformOutgoingFriendMessage, transformOutgoingGroupMessage } from '@/transform/message/outgoing';
import { BotMsgForwardPack, rawMessage } from 'tanebi';
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

export const GetMessage = defineApi(
    'get_message',
    z.object({
        message_scene: zMessageScene,
        peer_id: z.number().int().positive(),
        message_seq: z.number().int().positive(),
    }),
    async (app, payload) => {
        if (payload.message_scene === 'friend') {
            const friend = await app.bot.getFriend(payload.peer_id);
            if (!friend) {
                return Failed(-404, 'Friend not found');
            }
            const [message] = await friend.getMessages(payload.message_seq, payload.message_seq);
            if (!message) {
                return Failed(-404, 'Message not found');
            }
            return Ok({
                message: transformIncomingFriendMessage(friend, message),
            });
        } else if (payload.message_scene === 'group') {
            const group = await app.bot.getGroup(payload.peer_id);
            if (!group) {
                return Failed(-404, 'Group not found');
            }
            const [message] = await group.getMessages(payload.message_seq, payload.message_seq);
            if (!message) {
                return Failed(-404, 'Message not found');
            }
            const member = await group.getMember(message[rawMessage].senderUin);
            if (!member) {
                return Ok({
                    message: transformDanglingIncomingGroupMessage(group, message),
                });
            }
            return Ok({
                message: transformIncomingGroupMessage(group, member, message),
            });
        }
        return Failed(-400, 'Unsupported message scene');
    }
);

export const GetHistoryMessages = defineApi(
    'get_history_messages',
    z.object({
        message_scene: zMessageScene,
        peer_id: z.number().int().positive(),
        start_message_seq: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(20),
    }),
    async (app, payload) => {
        if (payload.message_scene === 'friend') {
            const friend = await app.bot.getFriend(payload.peer_id);
            if (!friend) {
                return Failed(-404, 'Friend not found');
            }
            const originSeq = payload.start_message_seq ?? await friend.getLatestMessageSequence();
            const messages = await friend.getMessages(Math.max(1, originSeq - payload.limit + 1), originSeq);
            return Ok({
                messages: messages.map((msg) => transformIncomingFriendMessage(friend, msg)),
            });
        } else if (payload.message_scene === 'group') {
            const group = await app.bot.getGroup(payload.peer_id);
            if (!group) {
                return Failed(-404, 'Group not found');
            }
            const originSeq = payload.start_message_seq ?? group.getLatestMessageSequence();
            const messages = await group.getMessages(Math.max(1, originSeq - payload.limit + 1), originSeq);
            return Ok({
                messages: await Promise.all(messages.map(async (msg) => {
                    const member = await group.getMember(msg[rawMessage].senderUin);
                    if (!member) {
                        return transformDanglingIncomingGroupMessage(group, msg);
                    }
                    return transformIncomingGroupMessage(group, member, msg);
                })),
            });
        } else {
            return Failed(-400, 'Unsupported message scene');
        }
    }
);

export const GetForwardedMessages = defineApi(
    'get_forwarded_messages',
    z.object({
        forward_id: z.string(),
    }),
    async (app, payload) => {
        const downloadedMsgs = await new BotMsgForwardPack(
            {
                type: 'forward',
                resId: payload.forward_id,
                recursiveCount: 0, // dummy, not used
                preview: [], // dummy, not used
            },
            app.bot,
        ).download();
        return Ok({
            messages: downloadedMsgs.map(transformIncomingForwardedMessage),
        });
    }
);

export const MessageApi = [
    SendPrivateMessage,
    SendGroupMessage,
    GetMessage,
    GetHistoryMessages,
    GetForwardedMessages,
];
