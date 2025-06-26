import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const MessageContentHead = ProtoMessage.of({
    type: ProtoField(1, ScalarType.UINT32), // message type
    subType: ProtoField(2, ScalarType.UINT32, true), // message subtype (0x211/0x2dc/0x210 and other system message subtypes, same as c2c_cmd)
    c2cCmd: ProtoField(3, ScalarType.UINT32, true), // c2c message subtype
    random: ProtoField(4, ScalarType.UINT32, true),
    sequence: ProtoField(5, ScalarType.UINT32, true),
    timestamp: ProtoField(6, ScalarType.INT64, true),
    pkgNum: ProtoField(7, ScalarType.INT64, true), // number of packages, not 1 when the message needs to be sent in packages
    pkgIndex: ProtoField(8, ScalarType.UINT32, true), // current package index, starting from 0
    divSeq: ProtoField(9, ScalarType.UINT32, true), // message package seq, the div_seq of the same message is the same
    autoReply: ProtoField(10, ScalarType.UINT32),
    ntMsgSeq: ProtoField(11, ScalarType.UINT32, true), // unique incremental seq of c2c messages between two uins
    msgUid: ProtoField(12, ScalarType.UINT64, true),
    forward: ProtoField(15, () => ({
        field1: ProtoField(1, ScalarType.UINT32, true), // 0
        field2: ProtoField(2, ScalarType.UINT32, true), // 0
        field3: ProtoField(3, ScalarType.UINT32, true), // for friend: 2, for group: null
        unknownBase64: ProtoField(4, ScalarType.STRING, true),
        avatar: ProtoField(5, ScalarType.STRING, true),
    }), true),
});