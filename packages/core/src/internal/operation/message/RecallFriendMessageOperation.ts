import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoC2CRecallMsg } from '@/internal/packet/message/action/SsoC2CRecallMsg';

export const RecallFriendMessageOperation = defineOperation(
    'trpc.msg.msg_svc.MsgService.SsoC2CRecallMsg',
    (ctx, friendUid: string, clientSequence: number, random: number, timestamp: number, ntMsgSeq: number) =>
        SsoC2CRecallMsg.encode({
            type: 1,
            targetUid: friendUid,
            info: {
                clientSequence,
                random,
                messageUid: 0x01000000n << 32n | BigInt(random),
                timestamp,
                field5: 0,
                ntMsgSeq,
            },
            field5: {
                field1: 0,
                field2: 0,
            },
            field6: 0,
        }),
);