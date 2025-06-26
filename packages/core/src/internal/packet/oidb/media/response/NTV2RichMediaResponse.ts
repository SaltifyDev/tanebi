import { DeleteResp } from '@/internal/packet/oidb/media/response/DeleteResp';
import { DownloadResp } from '@/internal/packet/oidb/media/response/DownloadResp';
import { DownloadRKeyResp } from '@/internal/packet/oidb/media/response/DownloadRKeyResp';
import { DownloadSafeResp } from '@/internal/packet/oidb/media/response/DownloadSafeResp';
import { MsgInfoAuthResp } from '@/internal/packet/oidb/media/response/MsgInfoAuthResp';
import { MultiMediaRespHead } from '@/internal/packet/oidb/media/response/MultiMediaRespHead';
import { UploadCompletedResp } from '@/internal/packet/oidb/media/response/UploadCompletedResp';
import { UploadKeyRenewalResp } from '@/internal/packet/oidb/media/response/UploadKeyRenewalResp';
import { UploadResp } from '@/internal/packet/oidb/media/response/UploadResp';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const NTV2RichMediaResponse = ProtoMessage.of({
    respHead: ProtoField(1, () => MultiMediaRespHead.fields, true, false),
    upload: ProtoField(2, () => UploadResp.fields, true, false),
    download: ProtoField(3, () => DownloadResp.fields, true, false),
    downloadRKey: ProtoField(4, () => DownloadRKeyResp.fields, true, false),
    delete: ProtoField(5, () => DeleteResp.fields, true, false),
    uploadCompleted: ProtoField(6, () => UploadCompletedResp.fields, true, false),
    msgInfoAuth: ProtoField(7, () => MsgInfoAuthResp.fields, true, false),
    uploadKeyRenewal: ProtoField(8, () => UploadKeyRenewalResp.fields, true, false),
    downloadSafe: ProtoField(9, () => DownloadSafeResp.fields, true, false),
    extension: ProtoField(99, ScalarType.BYTES, true, false),
});

export function NTV2RichMediaResponseOf<T extends 
    Exclude<keyof typeof NTV2RichMediaResponse.fields, 'respHead' | 'extension'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(_type: T) {
    return NTV2RichMediaResponse.fields as ({
        [K in T | 'respHead' | 'extension']: typeof NTV2RichMediaResponse.fields[K];
    });
}