import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export const SetMemberAdmin = new OidbSvcContract(0x1096, 1, {
    groupUin: ProtoField(1, ScalarType.UINT32),
    memberUid: ProtoField(2, ScalarType.STRING),
    isSet: ProtoField(3, ScalarType.BOOL),
});
