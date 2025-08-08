import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const LongMessageSettings = ProtoMessage.of({
    field1: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
    field4: ProtoField(4, ScalarType.UINT32),
});