import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FlashTransferUploadRequest = ProtoMessage.of({
  field1: ProtoField(1, 'uint32'),
  appId: ProtoField(2, 'uint32'),
  field3: ProtoField(3, 'uint32'),
  body: ProtoField(107, {
    field1: ProtoField(1, 'bytes'),
    uKey: ProtoField(2, 'string'),
    start: ProtoField(3, 'uint32'),
    end: ProtoField(4, 'uint32'),
    sha1: ProtoField(5, 'bytes'),
    sha1StateV: ProtoField(6, {
      state: ProtoField(1, 'bytes', 'repeated'),
    }),
    body: ProtoField(7, 'bytes'),
  }),
});

export const FlashTransferUploadResponse = ProtoMessage.of({
  status: ProtoField(5, 'string'),
});
