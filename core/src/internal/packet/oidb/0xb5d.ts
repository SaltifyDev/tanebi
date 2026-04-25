import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetFriendRequestRequest = ProtoMessage.of({
  accept: ProtoField(1, 'uint32'),
  targetUid: ProtoField(2, 'string'),
});
