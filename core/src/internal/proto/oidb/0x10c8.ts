import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const SetGroupRequestRequest = ProtoMessage.of({
  accept: ProtoField(1, 'uint32'),
  body: ProtoField(2, {
    sequence: ProtoField(1, 'uint32'),
    eventType: ProtoField(2, 'uint32'),
    groupUin: ProtoField(3, 'uint32'),
    message: ProtoField(4, 'string'),
  }),
});
