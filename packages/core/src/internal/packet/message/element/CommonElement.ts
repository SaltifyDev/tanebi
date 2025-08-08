import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const CommonElement = ProtoMessage.of({
    serviceType: ProtoField(1, ScalarType.INT32, false, false),
    pbElement: ProtoField(2, ScalarType.BYTES, true, false),
    businessType: ProtoField(3, ScalarType.UINT32, false, false),
});