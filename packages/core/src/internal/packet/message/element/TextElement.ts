import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const TextElement = ProtoMessage.of({
    str: ProtoField(1, ScalarType.STRING, true, false),
    link: ProtoField(2, ScalarType.STRING, true, false),
    attr6Buf: ProtoField(3, ScalarType.BYTES, true, false),
    attr7Buf: ProtoField(4, ScalarType.BYTES, true, false),
    buf: ProtoField(11, ScalarType.BYTES, true, false),
    pbReserve: ProtoField(12, ScalarType.BYTES, true, false),
});

export enum MentionType {
    Someone = 2,
    All = 1,
}

export const MentionExtra = ProtoMessage.of({
    type: ProtoField(3, ScalarType.UINT32),
    uin: ProtoField(4, ScalarType.UINT32, true, false),
    field5: ProtoField(5, ScalarType.UINT32, true, false),
    uid: ProtoField(9, ScalarType.STRING),
});