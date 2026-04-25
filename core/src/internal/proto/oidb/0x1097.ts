import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const QuitGroupRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
});
