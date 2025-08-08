import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoGetC2CMsg = ProtoMessage.of({
    peerUin: ProtoField(1, ScalarType.UINT64),
    peerUid: ProtoField(2, ScalarType.STRING),
    startSequence: ProtoField(3, ScalarType.UINT32),
    endSequence: ProtoField(4, ScalarType.UINT32),
});

export const SsoGetC2CMsgResponse = ProtoMessage.of({
    retcode: ProtoField(1, ScalarType.UINT32),
    errorMsg: ProtoField(2, ScalarType.STRING),
    startSequence: ProtoField(3, ScalarType.UINT32),
    endSequence: ProtoField(4, ScalarType.UINT32),
    messages: ProtoField(7, ScalarType.BYTES, false, true),
});