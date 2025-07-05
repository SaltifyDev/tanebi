import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export const SetGroupName = new OidbSvcContract(0x89a, 15, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(2, () => ({
        name: ProtoField(3, ScalarType.STRING),
    })),
});
