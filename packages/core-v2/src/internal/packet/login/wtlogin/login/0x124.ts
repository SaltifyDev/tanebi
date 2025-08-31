import { Tlv, TlvFixedBytesField } from '@/internal/util/tlv';

export const TlvLogin0x124 = Tlv.tagged([
    TlvFixedBytesField('empty', 12),
], '0x124');