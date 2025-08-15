import { defineOperation } from '@/internal/operation/OperationBase';
import { SsoGetPeerSeq, SsoGetPeerSeqResponse } from '@/internal/packet/message/action/SsoGetPeerSeq';

export const GetFriendLatestSequenceOperation = defineOperation(
    'trpc.msg.msg_svc.MsgService.SsoGetPeerSeq',
    (ctx, peerUid: string) => SsoGetPeerSeq.encode({ peerUid }),
    (ctx, payload) => {
        const result = SsoGetPeerSeqResponse.decode(payload);
        return result.seq1 ?? result.seq2;
    },
);