import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const UploadCompletedReq = ProtoMessage.of({
    srvSendMsg: ProtoField(1, ScalarType.BOOL, false, false),
    clientRandomId: ProtoField(2, ScalarType.UINT64, false, false),
    msgInfo: ProtoField(3, () => MsgInfo.fields, true, false),
    clientSeq: ProtoField(4, ScalarType.UINT32, false, false),
});
