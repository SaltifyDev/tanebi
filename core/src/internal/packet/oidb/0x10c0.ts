import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchGroupNotificationsRequest = ProtoMessage.of({
  count: ProtoField(1, 'uint32'),
  startSeq: ProtoField(2, 'uint32'),
});

export const FetchGroupNotificationsResponse = ProtoMessage.of({
  notifications: ProtoField(1, {
    sequence: ProtoField(1, 'uint32'),
    notifyType: ProtoField(2, 'uint32'),
    requestState: ProtoField(3, 'uint32'),
    group: ProtoField(4, {
      groupUin: ProtoField(1, 'uint32'),
      groupName: ProtoField(2, 'string'),
    }),
    user1: ProtoField(5, {
      uid: ProtoField(1, 'string'),
      nickname: ProtoField(2, 'string'),
    }),
    user2: ProtoField(6, {
      uid: ProtoField(1, 'string'),
      nickname: ProtoField(2, 'string'),
    }, 'optional'),
    user3: ProtoField(7, {
      uid: ProtoField(1, 'string'),
      nickname: ProtoField(2, 'string'),
    }, 'optional'),
    time: ProtoField(8, 'uint32'),
    comment: ProtoField(10, 'string'),
  }, 'repeated'),
  nextStartSeq: ProtoField(2, 'uint32'),
});
