import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const Attribute = ProtoMessage.of({
    codePage: ProtoField(1, ScalarType.INT32, false, false),
    time: ProtoField(2, ScalarType.INT32, false, false),
    random: ProtoField(3, ScalarType.INT32, false, false),
    color: ProtoField(4, ScalarType.INT32, false, false),
    size: ProtoField(5, ScalarType.INT32, false, false),
    effect: ProtoField(6, ScalarType.INT32, false, false),
    charSet: ProtoField(7, ScalarType.INT32, false, false),
    pitchAndFamily: ProtoField(8, ScalarType.INT32, false, false),
    fontName: ProtoField(9, ScalarType.STRING, true, false),
    reserveData: ProtoField(10, ScalarType.BYTES, true, false),
});
