import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetMemberAdminRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  memberUid: ProtoField(2, 'string'),
  isAdmin: ProtoField(3, 'bool'),
});
