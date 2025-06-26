import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const TransElement = ProtoMessage.of({
    elemType: ProtoField(1, ScalarType.INT32, false, false),
    elemValue: ProtoField(2, ScalarType.BYTES, true, false),
});