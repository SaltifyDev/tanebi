import { Tlv, TlvFixedBytesField, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const OutgoingSsoPacketWrapper = Tlv.plain([
    TlvScalarField('protocol', 'uint32'),
    TlvScalarField('encryptionType', 'uint8'),
    TlvVariableField('d2', 'bytes', 'uint32', true),
    TlvScalarField('flag3', 'uint8'), // 0
    TlvVariableField('uin', 'string', 'uint32', true),
    TlvVariableField('encrypted', 'bytes', 'none', false),
]);

export const OutgoingSsoPacket = Tlv.plain([
    TlvVariableField('header', () => [
        TlvScalarField('sequence', 'uint32'),
        TlvScalarField('subAppId', 'uint32'),
        TlvScalarField('locale', 'uint32'),
        TlvFixedBytesField('bytes3', 12), // 020000000000000000000000
        TlvVariableField('tgt', 'bytes', 'uint32', true),
        TlvVariableField('command', 'string', 'uint32', true),
        TlvFixedBytesField('bytes6', 4), // 00000004
        TlvVariableField('guid', 'string', 'uint32', true),
        TlvFixedBytesField('bytes8', 4), // 00000004
        TlvVariableField('version', 'string', 'uint16', true),
        TlvVariableField('ssoReserveFields', 'bytes', 'uint32', true),
    ], 'uint32', true),
    TlvVariableField('body', 'bytes', 'uint32', true),
]);