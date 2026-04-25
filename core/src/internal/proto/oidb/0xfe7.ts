import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchGroupMemberDataRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  field2: ProtoField(2, 'uint32'),
  field3: ProtoField(3, 'uint32'),
  body: ProtoField(4, {
    memberName: ProtoField(10, 'bool'),
    memberCard: ProtoField(11, 'bool'),
    level: ProtoField(12, 'bool'),
    specialTitle: ProtoField(17, 'bool'),
    joinTimestamp: ProtoField(100, 'bool'),
    lastMsgTimestamp: ProtoField(101, 'bool'),
    shutUpTimestamp: ProtoField(102, 'bool'),
    permission: ProtoField(107, 'bool'),
  }),
  cookie: ProtoField(15, 'bytes', 'optional'),
});

export const FetchGroupMemberDataResponse = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  members: ProtoField(2, {
    id: ProtoField(1, {
      uid: ProtoField(2, 'string'),
      uin: ProtoField(4, 'uint32'),
    }),
    memberName: ProtoField(10, 'string'),
    memberCard: ProtoField(11, {
      memberCard: ProtoField(2, 'string', 'optional'),
    }),
    level: ProtoField(12, {
      level: ProtoField(2, 'uint32'),
    }),
    specialTitle: ProtoField(17, 'string', 'optional'),
    joinTimestamp: ProtoField(100, 'uint32'),
    lastMsgTimestamp: ProtoField(101, 'uint32'),
    shutUpTimestamp: ProtoField(102, 'uint32', 'optional'),
    permission: ProtoField(107, 'uint32'),
  }, 'repeated'),
  cookie: ProtoField(15, 'bytes', 'optional'),
});
