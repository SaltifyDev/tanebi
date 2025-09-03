import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const CommonElement = ProtoMessage.of({
    serviceType: ProtoField(1, ScalarType.INT32),
    pbElement: ProtoField(2, ScalarType.BYTES),
    businessType: ProtoField(3, ScalarType.UINT32),
});