import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const LargeFaceInfo = ProtoMessage.of({
    aniStickerPackId: ProtoField(1, ScalarType.STRING),
    aniStickerId: ProtoField(2, ScalarType.STRING),
    faceId: ProtoField(3, ScalarType.INT32),
    field4: ProtoField(4, ScalarType.INT32),
    aniStickerType: ProtoField(5, ScalarType.INT32),
    field6: ProtoField(6, ScalarType.STRING),
    preview: ProtoField(7, ScalarType.STRING),
    field9: ProtoField(9, ScalarType.INT32),
});