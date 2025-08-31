import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const SetGroupName = new OidbSvcContract(0x89a, 15, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(2, () => ({
        name: ProtoField(3, ScalarType.STRING),
    })),
});
