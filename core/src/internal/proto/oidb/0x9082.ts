import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetGroupMessageReactionRequest = ProtoMessage.of({
  groupUin: ProtoField(2, 'uint32'),
  sequence: ProtoField(3, 'uint32'),
  code: ProtoField(4, 'string'),
  type: ProtoField(5, 'uint32'),
});
