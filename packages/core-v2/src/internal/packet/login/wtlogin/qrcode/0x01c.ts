import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvQrCode0x01c = Tlv.tagged([
    TlvScalarField('expirationInSec', 'uint32'),
    TlvScalarField('expirationInMin', 'uint16'),
], '0x1c');