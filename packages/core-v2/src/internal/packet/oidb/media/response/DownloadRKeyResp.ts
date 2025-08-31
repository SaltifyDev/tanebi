import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const DownloadRKeyResp = ProtoMessage.of({
    rKeys: ProtoField(1, () => ({
        rkey: ProtoField(1, ScalarType.STRING, true, false),
        rkeyTtlSec: ProtoField(2, ScalarType.UINT64, false, false),
        storeId: ProtoField(3, ScalarType.UINT32, false, false),
        rkeyCreateTime: ProtoField(4, ScalarType.UINT32, true, false),
        type: ProtoField(5, ScalarType.UINT32, true, false),
    }), false, true),
});
