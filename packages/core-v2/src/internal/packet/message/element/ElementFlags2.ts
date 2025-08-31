import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const ElementFlags2 = ProtoMessage.of({
    colorTextId: ProtoField(1, ScalarType.UINT32, false, false),
    msgId: ProtoField(2, ScalarType.UINT64, false, false),
    whisperSessionId: ProtoField(3, ScalarType.UINT32, false, false),
    pttChangeBit: ProtoField(4, ScalarType.UINT32, false, false),
    vipStatus: ProtoField(5, ScalarType.UINT32, false, false),
    compatibleId: ProtoField(6, ScalarType.UINT32, false, false),
    insts: ProtoField(7, () => Instance.fields, false, true),
    msgRptCnt: ProtoField(8, ScalarType.UINT32, false, false),
    srcInst: ProtoField(9, () => Instance.fields, true, false),
    longtitude: ProtoField(10, ScalarType.UINT32, false, false),
    latitude: ProtoField(11, ScalarType.UINT32, false, false),
    customFont: ProtoField(12, ScalarType.UINT32, false, false),
    pcSupportDef: ProtoField(13, () => PcSupportDef.fields, true, false),
    crmFlags: ProtoField(14, ScalarType.UINT32, true, false),
});

export const Instance = ProtoMessage.of({
    appId: ProtoField(1, ScalarType.UINT32, false, false),
    instId: ProtoField(2, ScalarType.UINT32, false, false),
});

export const PcSupportDef = ProtoMessage.of({
    pcPtlBegin: ProtoField(1, ScalarType.UINT32, false, false),
    pcPtlEnd: ProtoField(2, ScalarType.UINT32, false, false),
    macPtlBegin: ProtoField(3, ScalarType.UINT32, false, false),
    macPtlEnd: ProtoField(4, ScalarType.UINT32, false, false),
    ptlsSupport: ProtoField(5, ScalarType.UINT32, false, true),
    ptlsNotSupport: ProtoField(6, ScalarType.UINT32, false, true),
});