import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export const SetMemberCard = new OidbSvcContract(0x8fc, 3, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(3, () => ({
        targetUid: ProtoField(1, ScalarType.STRING),
        card: ProtoField(8, ScalarType.STRING),
    })),
});
