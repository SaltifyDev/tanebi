import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const MuteAllMembers = new OidbSvcContract(0x89a, 0, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(2, () => ({
        duration: ProtoField(17, ScalarType.UINT32, true),
    })),
});
