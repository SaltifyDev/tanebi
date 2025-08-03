import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SsoGetRoamMsg = ProtoMessage.of({
    peerUid: ProtoField(1, ScalarType.STRING),
    time: ProtoField(2, ScalarType.UINT32),
    random: ProtoField(3, ScalarType.UINT32), // 0 is ok
    count: ProtoField(4, ScalarType.UINT32), // max 30
    direction: ProtoField(5, ScalarType.UINT32), // 1 for up, 2 for down
});

export const SsoGetRoamMsgResponse = ProtoMessage.of({
    peerUid: ProtoField(3, ScalarType.STRING),
    isComplete: ProtoField(4, ScalarType.BOOL),
    timestamp: ProtoField(5, ScalarType.UINT32),
    random: ProtoField(6, ScalarType.UINT32),
    messages: ProtoField(7, ScalarType.BYTES, false, true),
});