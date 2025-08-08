import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const FriendRecall = ProtoMessage.of({
    body: ProtoField(1, () => ({
        fromUid: ProtoField(1, ScalarType.STRING),
        clientSequence: ProtoField(3, ScalarType.UINT32),
        tipInfo: ProtoField(13, () => ({
            tip: ProtoField(2, ScalarType.STRING),
        })),
    }))
});