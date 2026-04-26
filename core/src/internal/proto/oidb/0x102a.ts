import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchPSKeyRequest = ProtoMessage.of({
  domains: ProtoField(1, 'string', 'repeated'),
});

export const FetchPSKeyResponse = ProtoMessage.of({
  psKeyEntries: ProtoField(1, ['string', 'string']),
});

export const FetchClientKeyResponse = ProtoMessage.of({
  clientKey: ProtoField(3, 'string'),
});
