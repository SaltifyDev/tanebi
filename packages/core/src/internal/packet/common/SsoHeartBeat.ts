import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SsoHeartBeat = ProtoMessage.of({
    type: ProtoField(1, ScalarType.INT32),
});