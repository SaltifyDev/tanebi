import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GroupInvitationRequest = ProtoMessage.of({
    command: ProtoField(1, ScalarType.INT32),
    info: ProtoField(2, () => ({
        inner: ProtoField(1, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32),
            targetUid: ProtoField(5, ScalarType.STRING),
            invitorUid: ProtoField(6, ScalarType.STRING),
        })),
    })),
});