import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvLogin0x107 = Tlv.tagged([
    TlvScalarField('picType', 'uint16'), // 0x0001
    TlvScalarField('capType', 'uint8'), // 0x00
    TlvScalarField('picSize', 'uint16'), // 0x0d
    TlvScalarField('retType', 'uint8'), // 0x01
], '0x107');