import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const IPv4 = ProtoMessage.of({
    outIP: ProtoField(1, ScalarType.UINT32, false, false),
    outPort: ProtoField(2, ScalarType.UINT32, false, false),
    inIP: ProtoField(3, ScalarType.UINT32, false, false),
    inPort: ProtoField(4, ScalarType.UINT32, false, false),
    ipType: ProtoField(5, ScalarType.UINT32, false, false),
});

export const IPv6 = ProtoMessage.of({
    outIP: ProtoField(1, ScalarType.BYTES, true, false),
    outPort: ProtoField(2, ScalarType.UINT32, false, false),
    inIP: ProtoField(3, ScalarType.BYTES, true, false),
    inPort: ProtoField(4, ScalarType.UINT32, false, false),
    ipType: ProtoField(5, ScalarType.UINT32, false, false),
});