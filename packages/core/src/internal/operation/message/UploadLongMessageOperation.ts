import { buildForwarded, OutgoingForwardedMessage } from '@/internal/message/outgoing/forwarded';
import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoSendLongMsg, SsoSendLongMsgResponse } from '@/internal/packet/message/action/SsoSendLongMsg';
import { LongMessagePayload } from '@/internal/packet/message/forward/LongMessagePayload';
import { PushMsgBody } from '@/internal/packet/message/PushMsg';
import { gzipSync } from 'node:zlib';

export const UploadLongMessageOperation = defineOperation(
    'trpc.group.long_msg_interface.MsgService.SsoSendLongMsg',
    (ctx, msgs: OutgoingForwardedMessage[], groupUin?: number) => {
        const payload = LongMessagePayload.encode({
            actions: [{
                command: 'MultiMsg',
                data: {
                    msgs: msgs.map(buildForwarded).map(msg => PushMsgBody.encode(msg)),
                },
            }]
        });
        return SsoSendLongMsg.encode({
            info: {
                type: groupUin ? 3 : 1,
                uidInfo: {
                    uid: groupUin?.toString() ?? ctx.keystore.uid,                  
                },
                groupUin,
                payload: gzipSync(payload),
            },
            settings: {
                field1: 4,
                field2: 1,
                field3: 7,
                field4: 0,
            }
        });
    },
    (ctx, payload) => {
        const res = SsoSendLongMsgResponse.decode(payload);
        return res.result.resId;
    }
);