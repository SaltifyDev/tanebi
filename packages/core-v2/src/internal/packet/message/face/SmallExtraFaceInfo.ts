import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SmallExtraFaceInfo = ProtoMessage.of({
    faceId: ProtoField(1, ScalarType.UINT32),
    text1: ProtoField(2, ScalarType.STRING, true),
    text2: ProtoField(3, ScalarType.STRING, true),
});