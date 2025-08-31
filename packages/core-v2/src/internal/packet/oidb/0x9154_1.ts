import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const FetchFaceDetails = new OidbSvcContract(0x9154, 1, {
    field1: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.STRING),
});

export const FetchFaceDetailsResponse = new OidbSvcContract(0x9154, 1, {
    commonFace: ProtoField(2, () => FacesData.fields, true, false),
    specialBigFace: ProtoField(3, () => FacesData.fields, true, false),
    specialMagicFace: ProtoField(4, () => FacesData.fields, true, false),
});

export const FacesData = ProtoMessage.of({
    facePackList: ProtoField(1, () => ({
        facePackName: ProtoField(1, ScalarType.STRING, true, false),
        faces: ProtoField(2, () => FaceDetail.fields, false, true),
    }), false, true),
    resourceUrl: ProtoField(2, () => FaceResourceUrl.fields, true, false),
});

export const FaceDetail = ProtoMessage.of({
    qSid: ProtoField(1, ScalarType.STRING),
    qDes: ProtoField(2, ScalarType.STRING, true, false),
    emCode: ProtoField(3, ScalarType.STRING, true, false),
    qCid: ProtoField(4, ScalarType.INT32, true, false),
    aniStickerType: ProtoField(5, ScalarType.INT32, true, false),
    aniStickerPackId: ProtoField(6, ScalarType.INT32, true, false),
    aniStickerId: ProtoField(7, ScalarType.INT32, true, false),
    url: ProtoField(8, () => FaceResourceUrl.fields, true, false),
    faceNameAlias: ProtoField(9, ScalarType.STRING, false, true),
    unknown10: ProtoField(10, ScalarType.INT32, true, false),
    aniStickerWidth: ProtoField(13, ScalarType.INT32, true, false),
    aniStickerHeight: ProtoField(14, ScalarType.INT32, true, false),
});

export const FaceResourceUrl = ProtoMessage.of({
    baseUrl: ProtoField(1, ScalarType.STRING, true, false),
    advUrl: ProtoField(2, ScalarType.STRING, true, false),
});
