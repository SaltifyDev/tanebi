import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const ProfileLikeRequest = ProtoMessage.of({
  targetUid: ProtoField(11, 'string'),
  field2: ProtoField(12, 'uint32'),
  count: ProtoField(13, 'uint32'),
});
