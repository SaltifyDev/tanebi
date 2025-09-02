import { MessageBody } from '@/internal/packet/message/MessageBody';
import { ContentHead } from '@/internal/packet/message/ContentHead';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const PbSendMsg = ProtoMessage.of({
    routingHead: ProtoField(1, () => ({
        c2cExt: ProtoField(1, () => ({
            uin: ProtoField(1, ScalarType.UINT32, true, false),
            uid: ProtoField(2, ScalarType.STRING, true, false),
            field3: ProtoField(3, ScalarType.UINT32, true, false),
            sig: ProtoField(4, ScalarType.UINT32, true, false),
            receiverUin: ProtoField(5, ScalarType.UINT32, true, false),
            receiverUid: ProtoField(6, ScalarType.STRING, true, false),
        }), true, false),
        groupExt: ProtoField(2, () => ({
            groupCode: ProtoField(1, ScalarType.UINT32, true, false),
        }), true, false),
        groupTemp: ProtoField(3, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32, true, false),
            toUin: ProtoField(2, ScalarType.UINT32, true, false),
        }), true, false),
        wpaTmp: ProtoField(6, () => ({
            toUin: ProtoField(1, ScalarType.UINT64, false, false),
            sig: ProtoField(2, ScalarType.BYTES, true, false),
        }), true, false),
        trans0X211: ProtoField(15, () => ({
            toUin: ProtoField(1, ScalarType.UINT64, true, false),
            ccCmd: ProtoField(2, ScalarType.UINT32, true, false),
            uid: ProtoField(8, ScalarType.STRING, true, false),
        }), true, false),
    }), true, false),
    contentHead: ProtoField(2, () => ContentHead.fields, true, false),
    body: ProtoField(3, () => MessageBody.fields, true, false),
    clientSequence: ProtoField(4, ScalarType.UINT32, true, false),
    random: ProtoField(5, ScalarType.UINT32, true, false),
    syncCookie: ProtoField(6, ScalarType.BYTES, true, false),
    via: ProtoField(8, ScalarType.UINT32, true, false),
    dataStatist: ProtoField(9, ScalarType.UINT32, true, false),
    control: ProtoField(12, () => ({
        msgFlag: ProtoField(1, ScalarType.INT32, false, false),
    }), true, false),
    multiSendSeq: ProtoField(14, ScalarType.UINT32, false, false),
});

export const PbSendMsgResponse = ProtoMessage.of({
    resultCode: ProtoField(1, ScalarType.INT32, false, false),
    errMsg: ProtoField(2, ScalarType.STRING, true, false),
    timestamp1: ProtoField(3, ScalarType.UINT32, false, false),
    field10: ProtoField(10, ScalarType.UINT32, false, false),
    groupSequence: ProtoField(11, ScalarType.UINT32, true, false),
    timestamp2: ProtoField(12, ScalarType.UINT32, false, false),
    privateSequence: ProtoField(14, ScalarType.UINT32, false, false),
});