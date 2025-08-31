import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const SetMemberCard = new OidbSvcContract(0x8fc, 3, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(3, () => ({
        targetUid: ProtoField(1, ScalarType.STRING),
        card: ProtoField(8, ScalarType.STRING),
    })),
});
