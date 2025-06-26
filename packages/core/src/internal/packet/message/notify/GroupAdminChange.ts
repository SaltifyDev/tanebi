import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GroupAdminChange = ProtoMessage.of({
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(4, () => ({
        unset: ProtoField(1, () => ({
            targetUid: ProtoField(1, ScalarType.STRING),
        }), true),
        set: ProtoField(2, () => ({
            targetUid: ProtoField(1, ScalarType.STRING),
        }), true),
    })),
});