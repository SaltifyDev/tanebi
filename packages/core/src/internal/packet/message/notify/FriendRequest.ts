import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const FriendRequest = ProtoMessage.of({
    body: ProtoField(1, () => ({
        fromUid: ProtoField(2, ScalarType.STRING),
        message: ProtoField(10, ScalarType.STRING),
        via: ProtoField(11, ScalarType.STRING, true),
    })),
});

// SBTX
export const FriendRequestExtractVia = ProtoMessage.of({
    body: ProtoField(1, () => ({
        via: ProtoField(5, ScalarType.STRING),
    })),
});