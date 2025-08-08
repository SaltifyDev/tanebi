import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const MuteMember = new OidbSvcContract(0x1253, 1, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    type: ProtoField(2, ScalarType.UINT32),
    body: ProtoField(3, () => ({
        targetUid: ProtoField(1, ScalarType.STRING),
        duration: ProtoField(2, ScalarType.UINT32),
    })),
});
