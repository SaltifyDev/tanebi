import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SendNudgeRequest = ProtoMessage.of({
  targetUin: ProtoField(1, 'uint32'),
  groupUin: ProtoField(2, 'uint32'),
  friendUin: ProtoField(5, 'uint32'),
  ext: ProtoField(6, 'uint32'),
});
