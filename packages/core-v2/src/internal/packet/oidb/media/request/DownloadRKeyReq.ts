import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const DownloadRKeyReq = ProtoMessage.of({
    types: ProtoField(1, ScalarType.INT32, false, true),
});
