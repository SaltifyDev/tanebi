import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchFaceDetailsRequest = ProtoMessage.of({
  field1: ProtoField(1, 'uint32'),
  field2: ProtoField(2, 'uint32'),
  field3: ProtoField(3, 'string'),
});

const FaceResourceUrl = ProtoMessage.of({
  baseUrl: ProtoField(1, 'string'),
  advUrl: ProtoField(2, 'string'),
});

const FaceEmoji = ProtoMessage.of({
  qSid: ProtoField(1, 'string'),
  qDes: ProtoField(2, 'string'),
  emCode: ProtoField(3, 'string'),
  qCid: ProtoField(4, 'uint32'),
  aniStickerType: ProtoField(5, 'uint32'),
  aniStickerPackId: ProtoField(6, 'uint32'),
  aniStickerId: ProtoField(7, 'uint32'),
  url: ProtoField(8, FaceResourceUrl),
  emojiNameAlias: ProtoField(9, 'string', 'repeated'),
  unknown10: ProtoField(10, 'uint32'),
  aniStickerWidth: ProtoField(13, 'uint32'),
  aniStickerHeight: ProtoField(14, 'uint32'),
});

const FaceResponseContent = ProtoMessage.of({
  emojiList: ProtoField(1, {
    emojiPackName: ProtoField(1, 'string'),
    emojiDetail: ProtoField(2, FaceEmoji, 'repeated'),
  }, 'repeated'),
  resourceUrl: ProtoField(2, FaceResourceUrl),
});

export const FetchFaceDetailsResponse = ProtoMessage.of({
  field1: ProtoField(1, 'uint32'),
  commonFace: ProtoField(2, FaceResponseContent),
  specialBigFace: ProtoField(3, FaceResponseContent),
  specialMagicFace: ProtoField(4, {
    field1: ProtoField(1, {
      emojiList: ProtoField(2, FaceEmoji, 'repeated'),
    }),
    resourceUrl: ProtoField(2, FaceResourceUrl),
  }),
});
