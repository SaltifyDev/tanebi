import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const AnonymousGroupMessageElement = ProtoMessage.of({
    flags: ProtoField(1, ScalarType.INT32, false, false),
    anonId: ProtoField(2, ScalarType.BYTES, true, false),
    anonNick: ProtoField(3, ScalarType.STRING, true, false),
    headPortrait: ProtoField(4, ScalarType.INT32, false, false),
    expireTime: ProtoField(5, ScalarType.INT32, false, false),
    bubbleId: ProtoField(6, ScalarType.INT32, false, false),
    rankColor: ProtoField(7, ScalarType.BYTES, true, false),
});