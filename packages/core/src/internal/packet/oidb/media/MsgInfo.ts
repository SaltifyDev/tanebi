import { ExtBizInfo } from '@/internal/packet/oidb/media/ExtBizInfo';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MsgInfo = ProtoMessage.of({
    msgInfoBody: ProtoField(1, () => MsgInfoBody.fields, false, true),
    extBizInfo: ProtoField(2, () => ExtBizInfo.fields, true, false),
});

export const MsgInfoBody = ProtoMessage.of({
    index: ProtoField(1, () => IndexNode.fields, true, false),
    picture: ProtoField(2, () => PictureInfo.fields, true, false),
    video: ProtoField(3, () => VideoInfo.fields, true, false),
    audio: ProtoField(4, () => AudioInfo.fields, true, false),
    fileExist: ProtoField(5, ScalarType.BOOL, false, false),
    hashSum: ProtoField(6, () => HashSum.fields, true, false),
});

export const PictureInfo = ProtoMessage.of({
    urlPath: ProtoField(1, ScalarType.STRING, true, false),
    ext: ProtoField(2, () => PicUrlExtInfo.fields, true, false),
    domain: ProtoField(3, ScalarType.STRING, true, false),
});

export const PicUrlExtInfo = ProtoMessage.of({
    originalParameter: ProtoField(1, ScalarType.STRING, true, false),
    bigParameter: ProtoField(2, ScalarType.STRING, true, false),
    thumbParameter: ProtoField(3, ScalarType.STRING, true, false),
});

export const VideoInfo = ProtoMessage.of({
});

export const VideoExtInfo = ProtoMessage.of({
    videoCodecFormat: ProtoField(1, ScalarType.UINT32, false, false),
});

export const AudioInfo = ProtoMessage.of({
});

export const HashSum = ProtoMessage.of({
});