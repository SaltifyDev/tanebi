import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetGroupWholeMuteRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  state: ProtoField(2, {
    isMute: ProtoField(17, 'int32'),
  }),
});

export const SetGroupNameRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  groupName: ProtoField(2, 'string'),
});
