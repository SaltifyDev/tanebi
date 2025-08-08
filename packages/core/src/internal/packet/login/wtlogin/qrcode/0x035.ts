import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvQrCode0x035 = Tlv.tagged([
    TlvScalarField('ptOsVersion', 'int32'),
], '0x35');