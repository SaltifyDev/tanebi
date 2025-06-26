import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const ExtBizInfo = ProtoMessage.of({
    pic: ProtoField(1, () => PicExtBizInfo.fields, true, false),
    video: ProtoField(2, () => VideoExtBizInfo.fields, true, false),
    ptt: ProtoField(3, () => PttExtBizInfo.fields, true, false),
    busiType: ProtoField(10, ScalarType.UINT32, false, false),
});

export const PicExtBizInfo = ProtoMessage.of({
    bizType: ProtoField(1, ScalarType.UINT32, false, false),
    textSummary: ProtoField(2, ScalarType.STRING, true, false),
    bytesPbReserveC2C: ProtoField(11, ScalarType.BYTES, true, false),
    bytesPbReserveTroop: ProtoField(12, ScalarType.BYTES, true, false),
    fromScene: ProtoField(1001, ScalarType.UINT32, false, false),
    toScene: ProtoField(1002, ScalarType.UINT32, false, false),
    oldFileId: ProtoField(1003, ScalarType.UINT32, false, false),
});

export const VideoExtBizInfo = ProtoMessage.of({
    fromScene: ProtoField(1, ScalarType.UINT32, false, false),
    toScene: ProtoField(2, ScalarType.UINT32, false, false),
    bytesPbReserve: ProtoField(3, ScalarType.BYTES, true, false),
});

export const PttExtBizInfo = ProtoMessage.of({
    srcUin: ProtoField(1, ScalarType.UINT64, false, false),
    pttScene: ProtoField(2, ScalarType.UINT32, false, false),
    pttType: ProtoField(3, ScalarType.UINT32, false, false),
    changeVoice: ProtoField(4, ScalarType.UINT32, false, false),
    waveform: ProtoField(5, ScalarType.BYTES, true, false),
    autoConvertText: ProtoField(6, ScalarType.UINT32, false, false),
    bytesReserve: ProtoField(11, ScalarType.BYTES, true, false),
    bytesPbReserve: ProtoField(12, ScalarType.BYTES, true, false),
    bytesGeneralFlags: ProtoField(13, ScalarType.BYTES, true, false),
});

