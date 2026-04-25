import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FileId = ProtoMessage.of({
  storeId: ProtoField(3, 'uint32'),
  appId: ProtoField(4, 'uint32'),
  ttl: ProtoField(10, 'uint32'),
});
