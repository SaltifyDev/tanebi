import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x521 = Tlv.tagged([
    TlvScalarField('productType', 'uint32'), // 0x13
    TlvVariableField('productDesc', 'string', 'uint16', false), // 'basicim'
], '0x521');