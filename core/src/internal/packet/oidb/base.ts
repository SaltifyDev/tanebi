import { ProtoField, ProtoMessage, } from '@saltify/typeproto';

export const OidbBase = ProtoMessage.of({
  command: ProtoField(1, 'uint32'),
  service: ProtoField(2, 'uint32'),
  result: ProtoField(3, 'uint32'),
  body: ProtoField(4, 'bytes'),
  message: ProtoField(5, 'string'),
  reserved: ProtoField(12, 'int32'),
});
