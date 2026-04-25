import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetFilteredFriendRequestRequest = ProtoMessage.of({
  selfUid: ProtoField(1, 'string'),
  requestUid: ProtoField(2, 'string'),
});
