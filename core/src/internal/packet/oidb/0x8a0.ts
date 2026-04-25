import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const KickMemberRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  kickFlag: ProtoField(2, 'uint32'),
  memberUid: ProtoField(3, 'string'),
  rejectAddRequest: ProtoField(4, 'bool'),
  reason: ProtoField(5, 'string'),
});
