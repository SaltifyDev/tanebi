import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';
import { Tlv, TlvVariableField } from '@/internal/util/binary/tlv';

export const TlvQrCode0x0d1 = Tlv.tagged([
    TlvVariableField('body', 'bytes', 'none', false),
], '0xd1');

export const TlvQrCode0x0d1Body = ProtoMessage.of({
    system: ProtoField(1, () => ({
        os: ProtoField(1, ScalarType.STRING),
        name: ProtoField(2, ScalarType.STRING),
    })),
    type: ProtoField(4, ScalarType.BYTES), // [0x30, 0x01]
});

export const TlvQrCode0x0d1_Response = ProtoMessage.of({
    url: ProtoField(2, ScalarType.STRING),
    qrSig: ProtoField(3, ScalarType.STRING),
});