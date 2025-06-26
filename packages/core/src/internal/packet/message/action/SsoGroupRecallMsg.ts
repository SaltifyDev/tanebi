import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SsoGroupRecallMsg = ProtoMessage.of({
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    info: ProtoField(3, () => ({
        sequence: ProtoField(1, ScalarType.UINT32),
    })),
});