import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x128 = Tlv.tagged([
    TlvScalarField('field0', 'uint16'), // 0
    TlvScalarField('guidNew', 'uint8'), // 0
    TlvScalarField('guidAvailable', 'uint8'), // 0
    TlvScalarField('guidChanged', 'uint8'), // 0
    TlvScalarField('guidFlag', 'uint32'), // 0
    TlvVariableField('os', 'string', 'uint16', false),
    TlvVariableField('guid', 'bytes', 'uint16', false),
    TlvVariableField('brand', 'string', 'uint16', false),
], '0x128');