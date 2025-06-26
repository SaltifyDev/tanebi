import { ctx as internalCtx, MessageType } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputMessageId } from '@app/common/types';
import { z } from 'zod';
import { MessageStoreType, OutgoingMessageStore } from '@app/storage/types';
import { PbSendMsg } from '@/internal/packet/message/PbSendMsg';
import { RecallFriendMessageOperation } from '@/internal/operation/message/RecallFriendMessageOperation';
import { RecallGroupMessageOperation } from '@/internal/operation/message/RecallGroupMessageOperation';

export const delete_msg = defineAction(
    'delete_msg',
    z.object({
        message_id: zOneBotInputMessageId,
    }),
    async (ctx, payload) => {
        const message = await ctx.storage.getById(payload.message_id);
        if (!message) {
            return Failed(404, 'Message not found');
        }
        if (message.type === MessageType.PrivateMessage) {
            if (message.storeType !== MessageStoreType.OutgoingMessageStore) {
                return Failed(400, 'Cannot delete incoming messages');
            }
            const friend = await ctx.bot.getFriend(message.peerUin);
            if (!friend) {
                return Failed(404, 'Friend not found');
            }
            const pbSendMsg = PbSendMsg.decode(OutgoingMessageStore.decode(message.body).pbElem);
            await ctx.bot[internalCtx].call(
                RecallFriendMessageOperation,
                friend.uid,
                pbSendMsg.clientSequence!,
                pbSendMsg.random ?? 0,
                message.createdAt,
                message.sequence
            );
        } else { // GroupMessage
            await ctx.bot[internalCtx].call(RecallGroupMessageOperation, message.peerUin, message.sequence);
        }
        return Ok();
    }
);
