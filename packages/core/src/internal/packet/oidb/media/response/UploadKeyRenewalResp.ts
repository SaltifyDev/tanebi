import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const UploadKeyRenewalResp = ProtoMessage.of({
    ukey: ProtoField(1, ScalarType.STRING, true, false),
    ukeyTtlSec: ProtoField(2, ScalarType.UINT64, false, false),
});
