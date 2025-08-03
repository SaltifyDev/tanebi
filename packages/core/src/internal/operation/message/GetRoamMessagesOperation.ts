import { parsePushMsgBody } from '@/internal/message/incoming';
import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGetRoamMsg, SsoGetRoamMsgResponse } from '@/internal/packet/message/action/SsoGetRoamMsg';

export enum GetRoamMessagesDirection {
    Up = 1,
    Down = 2,
}

export const GetRoamMessagesOperation = defineOperation(
    'trpc.msg.register_proxy.RegisterProxy.SsoGetRoamMsg',
    (ctx, peerUid: string, time: number, count: number, direction: GetRoamMessagesDirection) =>
        SsoGetRoamMsg.encode({
            peerUid,
            time,
            random: 0, // 0 is ok
            count: Math.min(count, 30), // max 30
            direction,
        }),
    (ctx, data) => {
        const response = SsoGetRoamMsgResponse.decode(data);
        return {
            isComplete: response.isComplete,
            timestamp: response.timestamp,
            messages: response.messages.map(parsePushMsgBody),
        };
    },
);