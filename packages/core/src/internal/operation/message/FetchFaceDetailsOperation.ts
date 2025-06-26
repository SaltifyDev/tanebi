import { defineOperation } from '@/internal/operation/OperationBase';
import { FaceDetail as aFaceDetail, FetchFaceDetails, FetchFaceDetailsResponse } from '@/internal/packet/oidb/0x9154_1';
import { InferProtoModel } from '@tanebijs/protobuf';

export type FaceDetail = InferProtoModel<typeof aFaceDetail.fields>;

export const FetchFaceDetailsOperation = defineOperation(
    'OidbSvcTrpcTcp.0x9154_1',
    () => FetchFaceDetails.encode({
        field1: 0,
        field2: 7,
        field3: '0',
    }),
    (ctx, payload): FaceDetail[] => {
        const response = FetchFaceDetailsResponse.decodeBodyOrThrow(payload);
        return [
            response.commonFace,
            response.specialBigFace,
            response.specialMagicFace,
        ].flatMap((face) => face!.facePackList.flatMap((facePack) => facePack.faces));
    },
);