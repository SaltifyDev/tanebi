import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvQrCode0x016 = Tlv.tagged([
    TlvScalarField('field0', 'uint32'),
    TlvScalarField('appId', 'uint32'),
    TlvScalarField('appIdQrCode', 'uint32'),
    TlvVariableField('guid', 'bytes', 'none', false),
    TlvVariableField('packageName', 'string', 'uint16', false),
    TlvVariableField('ptVersion', 'string', 'uint16', false),
    TlvVariableField('packageName2', 'string', 'uint16', false),
], '0x16');