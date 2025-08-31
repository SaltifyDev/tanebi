import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoHeartBeat = ProtoMessage.of({
    type: ProtoField(1, ScalarType.INT32),
});