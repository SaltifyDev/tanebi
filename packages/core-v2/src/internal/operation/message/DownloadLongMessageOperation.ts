import { defineOperation } from '@/internal/operation';
import { SsoRecvLongMsg, SsoRecvLongMsgResponse } from '@/internal/packet/message/action/SsoRecvLongMsg';
import { CommonMessage } from '@/internal/packet/message/CommonMessage';
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
        if (!downloadResult) throw new Error('下载合并转发消息失败');
        return downloadResult.data.msgs.map(buf => CommonMessage.decode(buf));
    },
);