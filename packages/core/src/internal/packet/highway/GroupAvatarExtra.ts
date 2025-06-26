import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GroupAvatarExtra = ProtoMessage.of({
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, () => ({
        field1: ProtoField(1, ScalarType.UINT32),
    })),
    field5: ProtoField(5, ScalarType.UINT32),
    field6: ProtoField(6, ScalarType.UINT32),
});
