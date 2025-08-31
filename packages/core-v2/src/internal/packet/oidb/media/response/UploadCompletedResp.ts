import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const UploadCompletedResp = ProtoMessage.of({
    msgSeq: ProtoField(1, ScalarType.UINT64, false, false),
});
