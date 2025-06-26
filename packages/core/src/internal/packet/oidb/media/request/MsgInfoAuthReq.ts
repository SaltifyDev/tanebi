import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MsgInfoAuthReq = ProtoMessage.of({
    msg: ProtoField(1, ScalarType.BYTES, true, false),
    authTime: ProtoField(2, ScalarType.UINT64, false, false),
});
