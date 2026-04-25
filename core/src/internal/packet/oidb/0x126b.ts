import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const DeleteFriendRequest = ProtoMessage.of({
  body: ProtoField(1, {
    targetUid: ProtoField(1, 'string'),
    field2: ProtoField(2, {
      field1: ProtoField(1, 'uint32'),
      field2: ProtoField(2, 'uint32'),
      field3: ProtoField(3, {
        field1: ProtoField(1, 'uint32'),
        field2: ProtoField(2, 'uint32'),
        field3: ProtoField(3, 'uint32'),
      }),
    }),
    block: ProtoField(3, 'bool'),
    field4: ProtoField(4, 'bool'),
  }),
});
