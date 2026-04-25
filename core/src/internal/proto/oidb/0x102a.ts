import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchClientKeyResponse = ProtoMessage.of({
  clientKey: ProtoField(3, 'string'),
});
