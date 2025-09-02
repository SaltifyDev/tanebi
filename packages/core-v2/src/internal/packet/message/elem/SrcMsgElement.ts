import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SrcMsgElement = ProtoMessage.of({
    origSeqs: ProtoField(1, ScalarType.UINT32, false, true),
    senderUin: ProtoField(2, ScalarType.UINT32, false, false),
    time: ProtoField(3, ScalarType.INT32, true, false),
    flag: ProtoField(4, ScalarType.INT32, true, false),
    elems: ProtoField(5, ScalarType.BYTES, false, true),
    type: ProtoField(6, ScalarType.INT32, true, false),
    richMsg: ProtoField(7, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(8, () => ({
        messageId: ProtoField(3, ScalarType.UINT64),
        senderUid: ProtoField(6, ScalarType.STRING, true),
        receiverUid: ProtoField(7, ScalarType.STRING, true),
        friendSequence: ProtoField(8, ScalarType.UINT32, true),
    }), true, false),
    sourceMsg: ProtoField(9, ScalarType.BYTES, true, false),
    toUin: ProtoField(10, ScalarType.UINT32, true, false),
    troopName: ProtoField(11, ScalarType.BYTES, true, false),
});