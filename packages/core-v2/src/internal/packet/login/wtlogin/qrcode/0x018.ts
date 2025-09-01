import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvQrCode0x018 = Tlv.tagged([
    TlvVariableField('a1', 'bytes', 'none', false),
], '0x18');