import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const SendProfileLike = new OidbSvcContract(0x7e5, 104, {
    targetUid: ProtoField(11, ScalarType.STRING),
    field12: ProtoField(12, ScalarType.UINT32), // 71
    count: ProtoField(13, ScalarType.UINT32),
});
