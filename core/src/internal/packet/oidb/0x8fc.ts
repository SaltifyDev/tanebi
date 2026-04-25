import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetMemberProfileRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  memLevelInfo: ProtoField(3, {
    memberUid: ProtoField(1, 'string'),
    specialTitle: ProtoField(5, 'string'),
    specialTitleExpireTime: ProtoField(6, 'int32'),
    card: ProtoField(8, 'string'),
  }, 'repeated'),
});
