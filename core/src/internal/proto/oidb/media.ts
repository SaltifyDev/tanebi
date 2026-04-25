import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const IndexNode = ProtoMessage.of({
  fileUuid: ProtoField(2, 'string'),
  storeId: ProtoField(3, 'uint32'),
  ttl: ProtoField(5, 'uint32'),
});

export const NTV2RichMediaRequest = ProtoMessage.of({
  reqHead: ProtoField(1, {
    common: ProtoField(1, {
      requestId: ProtoField(1, 'uint32'),
      command: ProtoField(2, 'uint32'),
    }),
    scene: ProtoField(2, {
      requestType: ProtoField(101, 'uint32'),
      businessType: ProtoField(102, 'uint32'),
      sceneType: ProtoField(200, 'uint32'),
      c2C: ProtoField(201, {
        accountType: ProtoField(1, 'uint32'),
        targetUid: ProtoField(2, 'string'),
      }),
    }),
    client: ProtoField(3, {
      agentType: ProtoField(1, 'uint32'),
    }),
  }),
  download: ProtoField(3, {
    node: ProtoField(1, IndexNode),
  }),
});

export const NTV2RichMediaResponse = ProtoMessage.of({
  download: ProtoField(3, {
    rKeyParam: ProtoField(1, 'string'),
    info: ProtoField(3, {
      domain: ProtoField(1, 'string'),
      urlPath: ProtoField(2, 'string'),
    }),
  }),
});
