import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const UploadCompletedResp = ProtoMessage.of({
    msgSeq: ProtoField(1, ScalarType.UINT64, false, false),
});
