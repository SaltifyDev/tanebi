import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchFriendRequestsRequest = ProtoMessage.of({
  version: ProtoField(1, 'uint32'),
  type: ProtoField(3, 'uint32'),
  selfUid: ProtoField(4, 'string'),
  startIndex: ProtoField(5, 'uint32'),
  reqNum: ProtoField(6, 'uint32'),
  getFlag: ProtoField(8, 'uint32'),
  startTime: ProtoField(9, 'uint32'),
  needCommFriend: ProtoField(12, 'uint32'),
  field22: ProtoField(22, 'uint32'),
});

export const FetchFriendRequestsResponse = ProtoMessage.of({
  info: ProtoField(3, {
    requests: ProtoField(7, {
      targetUid: ProtoField(1, 'string'),
      sourceUid: ProtoField(2, 'string'),
      state: ProtoField(3, 'uint32'),
      timestamp: ProtoField(4, 'uint32'),
      comment: ProtoField(5, 'string'),
      source: ProtoField(6, 'string'),
      sourceId: ProtoField(7, 'uint32'),
      subSourceId: ProtoField(8, 'uint32'),
    }, 'repeated'),
  }),
});
