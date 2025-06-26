import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGroupRecallMsg } from '@/internal/packet/message/action/SsoGroupRecallMsg';

export const RecallGroupMessageOperation = defineOperation(
    'trpc.msg.msg_svc.MsgService.SsoGroupRecallMsg',
    (ctx, groupUin: number, sequence: number) =>
        SsoGroupRecallMsg.encode({
            type: 1,
            groupUin,
            info: { sequence },
        }),
);