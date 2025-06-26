import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const DeleteReq = ProtoMessage.of({
    index: ProtoField(1, () => IndexNode.fields, false, true),
    needRecallMsg: ProtoField(2, ScalarType.BOOL, false, false),
    msgSeq: ProtoField(3, ScalarType.UINT64, false, false),
    msgRandom: ProtoField(4, ScalarType.UINT64, false, false),
    msgTime: ProtoField(5, ScalarType.UINT64, false, false),
});
