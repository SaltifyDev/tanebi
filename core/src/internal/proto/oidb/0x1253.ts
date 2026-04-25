import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetMemberMuteRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  type: ProtoField(2, 'uint32'),
  body: ProtoField(3, {
    memberUid: ProtoField(1, 'string'),
    duration: ProtoField(2, 'uint32'),
  }),
});
