import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const CustomElement = ProtoMessage.of({
    desc: ProtoField(1, ScalarType.BYTES, true, false),
    data: ProtoField(2, ScalarType.BYTES, true, false),
    enumType: ProtoField(3, ScalarType.INT32, false, false),
    ext: ProtoField(4, ScalarType.BYTES, true, false),
    sound: ProtoField(5, ScalarType.BYTES, true, false),
});