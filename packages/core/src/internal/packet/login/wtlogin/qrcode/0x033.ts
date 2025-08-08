import { Tlv, TlvFixedBytesField } from '@/internal/util/tlv';

export const TlvQrCode0x033 = Tlv.tagged([
    TlvFixedBytesField('guid', 16),
], '0x33');