import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchFilteredFriendRequestsRequest = ProtoMessage.of({
  field1: ProtoField(1, 'uint32'),
  field2: ProtoField(2, {
    count: ProtoField(1, 'uint32'),
  }),
});

export const FetchFilteredFriendRequestsResponse = ProtoMessage.of({
  info: ProtoField(2, {
    requests: ProtoField(1, {
      sourceUid: ProtoField(1, 'string'),
      sourceNickname: ProtoField(2, 'string'),
      comment: ProtoField(5, 'string'),
      source: ProtoField(6, 'string'),
      warningInfo: ProtoField(7, 'string'),
      timestamp: ProtoField(8, 'uint32'),
    }, 'repeated'),
  }),
});
