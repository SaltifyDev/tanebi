import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GroupRecall = ProtoMessage.of({
    operatorUid: ProtoField(1, ScalarType.STRING),
    recallMessages: ProtoField(3, () => ({
        sequence: ProtoField(1, ScalarType.UINT32, false, false),
        time: ProtoField(2, ScalarType.UINT32, false, false),
        random: ProtoField(3, ScalarType.UINT32, false, false),
        type: ProtoField(4, ScalarType.UINT32, false, false),
        flag: ProtoField(5, ScalarType.UINT32, false, false),
        authorUid: ProtoField(6, ScalarType.STRING, true, false),
    }), false, true),
    userDef: ProtoField(5, ScalarType.BYTES, true, false),
    groupType: ProtoField(6, ScalarType.INT32, false, false),
    opType: ProtoField(7, ScalarType.INT32, false, false),
    tipInfo: ProtoField(9, () => ({
        tip: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
});