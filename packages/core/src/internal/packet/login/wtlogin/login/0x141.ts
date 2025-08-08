import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x141 = Tlv.tagged([
    TlvVariableField('field0', 'string', 'uint32', false), // 'Unknown'
    TlvScalarField('networkType', 'uint16'), // 0
    TlvVariableField('apn', 'string', 'uint16', false), // ''
], '0x141');