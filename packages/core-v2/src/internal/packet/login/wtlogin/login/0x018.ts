import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvLogin0x018 = Tlv.tagged([
    TlvScalarField('pingVersion', 'uint16'), // 0
    TlvScalarField('ssoVersion', 'uint32'), // 5
    TlvScalarField('field2', 'uint32'), // 0
    TlvScalarField('appClientVersion', 'uint32'), // 8001
    TlvScalarField('uin', 'uint32'),
    TlvScalarField('field5', 'uint16'), // 0
    TlvScalarField('field6', 'uint16'), // 0
], '0x018');