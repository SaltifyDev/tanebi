import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x146 = Tlv.tagged([
    TlvScalarField('state', 'uint32'),
    TlvVariableField('tag', 'string', 'uint16', false),
    TlvVariableField('message', 'string', 'uint16', false),
    TlvScalarField('field0', 'uint32'),
], '0x146');