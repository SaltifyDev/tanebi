import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoGetPeerSeq = ProtoMessage.of({
    peerUid: ProtoField(1, ScalarType.STRING),
});

export const SsoGetPeerSeqResponse = ProtoMessage.of({
    seq1: ProtoField(3, ScalarType.UINT32),
    seq2: ProtoField(4, ScalarType.UINT32),
    latestMsgTime: ProtoField(5, ScalarType.UINT32),
});