import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const ExtraInfoElement = ProtoMessage.of({
    nick: ProtoField(1, ScalarType.STRING, true, false),
    groupCard: ProtoField(2, ScalarType.STRING, true, false),
    level: ProtoField(3, ScalarType.INT32, false, false),
    flags: ProtoField(4, ScalarType.INT32, false, false),
    groupMask: ProtoField(5, ScalarType.INT32, false, false),
    msgTailId: ProtoField(6, ScalarType.INT32, false, false),
    senderTitle: ProtoField(7, ScalarType.STRING, true, false),
    apnsTips: ProtoField(8, ScalarType.BYTES, true, false),
    uin: ProtoField(9, ScalarType.UINT64, false, false),
    msgStateFlag: ProtoField(10, ScalarType.INT32, false, false),
    apnsSoundType: ProtoField(11, ScalarType.INT32, false, false),
    newGroupFlag: ProtoField(12, ScalarType.INT32, false, false),
});