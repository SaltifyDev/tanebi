import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const LightAppElement = ProtoMessage.of({
    data: ProtoField(1, ScalarType.BYTES, false),
    msgResid: ProtoField(2, ScalarType.BYTES, false),
});