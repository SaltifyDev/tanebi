import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetGroupEssenceMessageRequest = ProtoMessage.of({
  groupCode: ProtoField(1, 'uint32'),
  sequence: ProtoField(2, 'uint32'),
  random: ProtoField(3, 'int32'),
});
