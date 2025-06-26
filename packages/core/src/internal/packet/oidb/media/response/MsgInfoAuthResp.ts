import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MsgInfoAuthResp = ProtoMessage.of({
    authCode: ProtoField(1, ScalarType.UINT32, false, false),
    msg: ProtoField(2, ScalarType.BYTES, true, false),
    resultTime: ProtoField(3, ScalarType.UINT64, false, false),
});
