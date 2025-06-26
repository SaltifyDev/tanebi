import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const FriendRecall = ProtoMessage.of({
    body: ProtoField(1, () => ({
        fromUid: ProtoField(1, ScalarType.STRING),
        clientSequence: ProtoField(3, ScalarType.UINT32),
        tipInfo: ProtoField(13, () => ({
            tip: ProtoField(2, ScalarType.STRING),
        })),
    }))
});