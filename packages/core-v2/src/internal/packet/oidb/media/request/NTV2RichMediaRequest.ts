import { MultiMediaReqHead } from '@/internal/packet/oidb/media/request/MultiMediaReqHead';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';
import { UploadReq } from '@/internal/packet/oidb/media/request/UploadReq';
import { DownloadReq } from '@/internal/packet/oidb/media/request/DownloadReq';
import { DownloadRKeyReq } from '@/internal/packet/oidb/media/request/DownloadRKeyReq';
import { DeleteReq } from '@/internal/packet/oidb/media/request/DeleteReq';
import { UploadCompletedReq } from '@/internal/packet/oidb/media/request/UploadCompletedReq';
import { MsgInfoAuthReq } from '@/internal/packet/oidb/media/request/MsgInfoAuthReq';
import { UploadKeyRenewalReq } from '@/internal/packet/oidb/media/request/UploadKeyRenewalReq';
import { DownloadSafeReq } from '@/internal/packet/oidb/media/request/DownloadSafeReq';

export const NTV2RichMediaRequest = ProtoMessage.of({
    reqHead: ProtoField(1, () => MultiMediaReqHead.fields, true, false),
    upload: ProtoField(2, () => UploadReq.fields, true, false),
    download: ProtoField(3, () => DownloadReq.fields, true, false),
    downloadRKey: ProtoField(4, () => DownloadRKeyReq.fields, true, false),
    delete: ProtoField(5, () => DeleteReq.fields, true, false),
    uploadCompleted: ProtoField(6, () => UploadCompletedReq.fields, true, false),
    msgInfoAuth: ProtoField(7, () => MsgInfoAuthReq.fields, true, false),
    uploadKeyRenewal: ProtoField(8, () => UploadKeyRenewalReq.fields, true, false),
    downloadSafe: ProtoField(9, () => DownloadSafeReq.fields, true, false),
    extension: ProtoField(99, ScalarType.BYTES, true, false),
});

export function NTV2RichMediaRequestOf<T extends 
    Exclude<keyof typeof NTV2RichMediaRequest.fields, 'reqHead' | 'extension'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(_type: T) {
    return NTV2RichMediaRequest.fields as ({
        [K in T | 'reqHead' | 'extension']: typeof NTV2RichMediaRequest.fields[K];
    });
}