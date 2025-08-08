import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const CommonHead = ProtoMessage.of({
    requestId: ProtoField(1, ScalarType.UINT32, false, false),
    command: ProtoField(2, ScalarType.UINT32, false, false),
});