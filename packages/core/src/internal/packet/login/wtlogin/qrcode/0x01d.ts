import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvQrCode0x01d = Tlv.tagged([
    TlvScalarField('field0', 'uint8'),
    TlvScalarField('miscBitmap', 'uint32'),
    TlvScalarField('field2', 'uint32'),
    TlvScalarField('field3', 'uint8'),
], '0x1d');