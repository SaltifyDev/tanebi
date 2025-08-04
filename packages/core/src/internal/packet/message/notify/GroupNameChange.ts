import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GroupNameChange = ProtoMessage.of({
    name: ProtoField(2, ScalarType.STRING),
});