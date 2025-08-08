import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const GroupJoinRequest = ProtoMessage.of({
    groupUin: ProtoField(1, ScalarType.UINT32),
    memberUid: ProtoField(3, ScalarType.STRING),
});