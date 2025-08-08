import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvQrCode0x01b = Tlv.tagged([
    TlvScalarField('micro', 'uint32'),
    TlvScalarField('version', 'uint32'),
    TlvScalarField('size', 'uint32'),
    TlvScalarField('margin', 'uint32'),
    TlvScalarField('dpi', 'uint32'),
    TlvScalarField('ecLevel', 'uint32'),
    TlvScalarField('hint', 'uint32'),
    TlvScalarField('field7', 'uint16'),
], '0x1b');