import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GeneralFlagsElement = ProtoMessage.of({
    bubbleDiyTextId: ProtoField(1, ScalarType.INT32, false, false),
    groupFlagNew: ProtoField(2, ScalarType.INT32, false, false),
    uin: ProtoField(3, ScalarType.UINT64, false, false),
    rpId: ProtoField(4, ScalarType.BYTES, true, false),
    prpFold: ProtoField(5, ScalarType.INT32, false, false),
    longTextFlag: ProtoField(6, ScalarType.INT32, false, false),
    longTextResId: ProtoField(7, ScalarType.STRING, true, false),
    groupType: ProtoField(8, ScalarType.INT32, false, false),
    toUinFlag: ProtoField(9, ScalarType.INT32, false, false),
    glamourLevel: ProtoField(10, ScalarType.INT32, false, false),
    memberLevel: ProtoField(11, ScalarType.INT32, false, false),
    groupRankSeq: ProtoField(12, ScalarType.INT64, false, false),
    olympicTorch: ProtoField(13, ScalarType.INT32, false, false),
    babyqGuideMsgCookie: ProtoField(14, ScalarType.BYTES, true, false),
    uin32ExpertFlag: ProtoField(15, ScalarType.INT32, false, false),
    bubbleSubId: ProtoField(16, ScalarType.INT32, false, false),
    pendantId: ProtoField(17, ScalarType.INT64, false, false),
    rpIndex: ProtoField(18, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(19, ScalarType.BYTES, true, false),
});