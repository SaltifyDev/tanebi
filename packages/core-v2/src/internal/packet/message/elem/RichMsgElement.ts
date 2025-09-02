import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const RichMsgElement = ProtoMessage.of({
    template1: ProtoField(1, ScalarType.BYTES, true, false),
    serviceId: ProtoField(2, ScalarType.INT32, true, false),
    msgResId: ProtoField(3, ScalarType.BYTES, true, false),
    rand: ProtoField(4, ScalarType.INT32, true, false),
    seq: ProtoField(5, ScalarType.INT32, true, false),
});