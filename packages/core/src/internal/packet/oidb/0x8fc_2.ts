import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const SetMemberSpecialTitle = new OidbSvcContract(0x8fc, 2, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(3, () => ({
        targetUid: ProtoField(1, ScalarType.STRING),
        specialTitle: ProtoField(5, ScalarType.STRING),
        expireTime: ProtoField(6, ScalarType.INT32),
        specialTitle2: ProtoField(7, ScalarType.STRING),
    })),
});
