import { defineApi, Failed, Ok } from '@/common/api';
import {
    transformDanglingIncomingGroupMessage,
    transformIncomingForwardedMessage,
    transformIncomingFriendMessage,
    transformIncomingGroupMessage,
} from '@/transform/message/incoming';
import { transformOutgoingFriendMessage, transformOutgoingGroupMessage } from '@/transform/message/outgoing';
import {
    GetForwardedMessagesInput,
    GetForwardedMessagesOutput,
    GetHistoryMessagesInput,
    GetHistoryMessagesOutput,
    GetMessageInput,
    GetMessageOutput,
    GetResourceTempUrlInput,
    GetResourceTempUrlOutput,
    RecallGroupMessageInput,
    RecallPrivateMessageInput,
    SendGroupMessageInput,
    SendGroupMessageOutput,
    SendPrivateMessageInput,
    SendPrivateMessageOutput,
} from '@saltify/milky-types';
import { BotMsgForwardPack, rawMessage } from 'tanebi';
import z from 'zod';

export const SendPrivateMessage = defineApi(
    'send_private_message',
    SendPrivateMessageInput,
    SendPrivateMessageOutput,
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
    SendGroupMessageInput,
    SendGroupMessageOutput,
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
    GetMessageInput,
    GetMessageOutput,
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
    GetHistoryMessagesInput,
    GetHistoryMessagesOutput,
    async (app, payload) => {
        if (payload.message_scene === 'friend') {
            const friend = await app.bot.getFriend(payload.peer_id);
            if (!friend) {
                return Failed(-404, 'Friend not found');
            }
            const originSeq = payload.start_message_seq ?? (await friend.getLatestMessageSequence());
            const oldestSeq = Math.max(1, originSeq - payload.limit + 1);
            const messages = await friend.getMessages(oldestSeq, originSeq);
            return Ok({
                messages: messages.map((msg) => transformIncomingFriendMessage(friend, msg)),
                next_message_seq: oldestSeq > 1 ? oldestSeq - 1 : undefined,
            });
        } else if (payload.message_scene === 'group') {
            const group = await app.bot.getGroup(payload.peer_id);
            if (!group) {
                return Failed(-404, 'Group not found');
            }
            const originSeq = payload.start_message_seq ?? (await group.getLatestMessageSequence());
            const oldestSeq = Math.max(1, originSeq - payload.limit + 1);
            const messages = await group.getMessages(oldestSeq, originSeq);
            return Ok({
                messages: await Promise.all(
                    messages.map(async (msg) => {
                        const member = await group.getMember(msg[rawMessage].senderUin);
                        if (!member) {
                            return transformDanglingIncomingGroupMessage(group, msg);
                        }
                        return transformIncomingGroupMessage(group, member, msg);
                    })
                ),
                next_message_seq: oldestSeq > 1 ? oldestSeq - 1 : undefined,
            });
        } else {
            return Failed(-400, 'Unsupported message scene');
        }
    }
);

export const GetForwardedMessages = defineApi(
    'get_forwarded_messages',
    GetForwardedMessagesInput,
    GetForwardedMessagesOutput,
    async (app, payload) => {
        const downloadedMsgs = await new BotMsgForwardPack(
            {
                type: 'forward',
                resId: payload.forward_id,
                recursiveCount: 0, // dummy, not used
                preview: [], // dummy, not used
            },
            app.bot
        ).download();
        return Ok({
            messages: downloadedMsgs.map(transformIncomingForwardedMessage),
        });
    }
);

export const GetResourceTempUrl = defineApi(
    'get_resource_temp_url',
    GetResourceTempUrlInput,
    GetResourceTempUrlOutput,
    async (app, payload) => {
        return Ok({
            url: await app.bot.getResourceDownloadUrl(payload.resource_id),
        });
    }
);

export const RecallPrivateMessage = defineApi(
    'recall_private_message',
    RecallPrivateMessageInput,
    z.object(),
    async (app, payload) => {
        const friend = await app.bot.getFriend(payload.user_id);
        if (!friend) {
            return Failed(-404, 'Friend not found');
        }
        await friend.recallMsg(payload.message_seq);
        return Ok({});
    }
);

export const RecallGroupMessage = defineApi(
    'recall_group_message',
    RecallGroupMessageInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) {
            return Failed(-404, 'Group not found');
        }
        await group.recallMsg(payload.message_seq);
        return Ok({});
    }
);

export const MessageApi = [
    SendPrivateMessage,
    SendGroupMessage,
    GetMessage,
    GetHistoryMessages,
    GetForwardedMessages,
    RecallPrivateMessage,
    RecallGroupMessage,
];
