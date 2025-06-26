import { defineOperation } from '@/internal/operation/OperationBase';
import { PbSendMsgResponse } from '@/internal/packet/message/PbSendMsg';
import { buildPbSendMsg, OutgoingMessage } from '@/internal/message/outgoing';

export const SendMessageOperation = defineOperation(
    'MessageSvc.PbSendMsg',
    (ctx, params: OutgoingMessage) => buildPbSendMsg(params),
    (ctx, payload) => {
        const response = PbSendMsgResponse.decode(payload);
        if (response.resultCode !== 0) {
            throw new Error(`Failed to send message: ${response.errMsg}`);
        } else {
            return {
                sequence: response.groupSequence ?? response.privateSequence,
                timestamp: response.timestamp1,
            };
        }
    }
);