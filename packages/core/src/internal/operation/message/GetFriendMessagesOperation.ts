import { parsePushMsgBody } from '@/internal/message/incoming';
import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGetC2CMsg, SsoGetC2CMsgResponse } from '@/internal/packet/message/action/SsoGetC2CMsg';

export const GetFriendMessagesOperation = defineOperation(
    'trpc.msg.register_proxy.RegisterProxy.SsoGetC2cMsg',
    (ctx, peerUid: string, startSequence: number, endSequence: number) =>
        SsoGetC2CMsg.encode({ peerUid, startSequence, endSequence }),
    (ctx, payload) => {
        const response = SsoGetC2CMsgResponse.decode(payload);
        if (response.retcode !== 0) {
            throw new Error(`Failed to get friend messages: ${response.errorMsg}`);
        }
        return response.messages.map(parsePushMsgBody).filter((msg) => msg !== undefined);
    }
);