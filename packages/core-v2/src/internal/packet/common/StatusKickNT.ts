import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const StatusKickNT = ProtoMessage.of({
    tip: ProtoField(3, ScalarType.STRING),
    title: ProtoField(4, ScalarType.STRING),
});