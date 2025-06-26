import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MarketFaceElement = ProtoMessage.of({
    summary: ProtoField(1, ScalarType.STRING, true, false),
    itemType: ProtoField(2, ScalarType.INT32, false, false),
    info: ProtoField(3, ScalarType.INT32, false, false),
    faceId: ProtoField(4, ScalarType.BYTES, true, false),
    tabId: ProtoField(5, ScalarType.INT32, false, false),
    subType: ProtoField(6, ScalarType.INT32, false, false),
    key: ProtoField(7, ScalarType.STRING, true, false),
    width: ProtoField(10, ScalarType.INT32, false, false),
    height: ProtoField(11, ScalarType.INT32, false, false),
    pbReserve: ProtoField(13, () => MarketfaceReserve.fields, true, false),
});
export const MarketfaceReserve = ProtoMessage.of({
    field8: ProtoField(8, ScalarType.INT32, false, false),
});