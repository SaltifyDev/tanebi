import { ExtBizInfo } from '@/internal/packet/oidb/media/ExtBizInfo';
import { FileInfo } from '@/internal/packet/oidb/media/FileInfo';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const UploadReq = ProtoMessage.of({
    uploadInfo: ProtoField(1, () => ({
        fileInfo: ProtoField(1, () => FileInfo.fields, true, false),
        subFileType: ProtoField(2, ScalarType.UINT32, false, false),
    }), false, true),
    tryFastUploadCompleted: ProtoField(2, ScalarType.BOOL, false, false),
    srvSendMsg: ProtoField(3, ScalarType.BOOL, false, false),
    clientRandomId: ProtoField(4, ScalarType.UINT64, false, false),
    compatQMsgSceneType: ProtoField(5, ScalarType.UINT32, false, false),
    extBizInfo: ProtoField(6, () => ExtBizInfo.fields, true, false),
    clientSeq: ProtoField(7, ScalarType.UINT32, false, false),
    noNeedCompatMsg: ProtoField(8, ScalarType.BOOL, false, false),
});
