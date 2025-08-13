import { parsePushMsgBody } from '@/internal/message/incoming';
import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoRecvLongMsg, SsoRecvLongMsgResponse } from '@/internal/packet/message/action/SsoRecvLongMsg';
import { LongMessagePayload } from '@/internal/packet/message/forward/LongMessagePayload';
import { gunzipSync } from 'node:zlib';

export const DownloadLongMessageOperation = defineOperation(
    'trpc.group.long_msg_interface.MsgService.SsoRecvLongMsg',
    (ctx, resId: string) => SsoRecvLongMsg.encode({
        info: {
            uidInfo: { uid: ctx.keystore.uid },
            resId,
            isAcquire: true,
        },
        settings: { field1: 2 }
    }),
    (ctx, payload) => {
        const downloadResult = LongMessagePayload.decode(
            gunzipSync((SsoRecvLongMsgResponse.decode(payload)).result.payload)
        ).actions.find(action => action.command === 'MultiMsg');
        if (!downloadResult) throw new Error('Failed to download long message');
        return downloadResult.data.msgs.map(parsePushMsgBody).filter((msg) => msg !== undefined);
    },
);