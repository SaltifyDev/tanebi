import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const MsgInfoAuthReq = ProtoMessage.of({
    msg: ProtoField(1, ScalarType.BYTES, true, false),
    authTime: ProtoField(2, ScalarType.UINT64, false, false),
});
