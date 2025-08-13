import { parsePushMsgBody } from '@/internal/message/incoming';
import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGetGroupMsg, SsoGetGroupMsgResponse } from '@/internal/packet/message/action/SsoGetGroupMsg';

export const GetGroupMessagesOperation = defineOperation(
    'trpc.msg.register_proxy.RegisterProxy.SsoGetGroupMsg',
    (ctx, groupUin: number, startSequence: number, endSequence: number) =>
        SsoGetGroupMsg.encode({
            groupInfo: { groupUin, startSequence, endSequence },
            filter: 1
        }),
    (ctx, payload) => {
        const response = SsoGetGroupMsgResponse.decode(payload);
        if (response.retcode !== 0) {
            throw new Error(`Failed to get group messages: ${response.errorMsg}`);
        }
        return response.body.messages.map(parsePushMsgBody).filter((msg) => msg !== undefined);
    }
);