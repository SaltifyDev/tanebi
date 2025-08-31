import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const IncomingSsoPacketWrapper = Tlv.plain([
    TlvScalarField('protocol', 'uint32'),
    TlvScalarField('encryptionType', 'uint8'),
    TlvScalarField('flag2', 'uint8'),
    TlvVariableField('uin', 'string', 'uint32', true),
    TlvVariableField('packet', 'bytes', 'none', false),
]);

export enum EncryptionType {
    None = 0,
    TeaByD2Key = 1,
    TeaByEmptyKey = 2,
}

export const IncomingSsoPacket = Tlv.plain([
    TlvVariableField('header', () => [
        TlvScalarField('sequence', 'uint32'),
        TlvScalarField('retcode', 'int32'),
        TlvVariableField('extra', 'string', 'uint32', true),
        TlvVariableField('command', 'string', 'uint32', true),
        TlvVariableField('msgCookie', 'bytes', 'uint32', true),
        TlvScalarField('compressionType', 'int32'),
        TlvVariableField('reserveField', 'bytes', 'uint32', true),
    ], 'uint32', true),
    TlvVariableField('raw', 'bytes', 'uint32', true),
]);

export enum CompressionType {
    None = 0,
    Zlib = 1,
    None_2 = 4,
}