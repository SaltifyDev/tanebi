import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchUserInfoByUidRequest = ProtoMessage.of({
  uid: ProtoField(1, 'string'),
  keys: ProtoField(3, {
    key: ProtoField(1, 'uint32'),
  }, 'repeated'),
});

export const FetchUserInfoResponse = ProtoMessage.of({
  body: ProtoField(1, {
    properties: ProtoField(2, {
      numberProps: ProtoField(1, ['uint32', 'uint32']),
      stringProps: ProtoField(2, ['uint32', 'string']),
    }),
    uin: ProtoField(3, 'uint32'),
  }),
});
