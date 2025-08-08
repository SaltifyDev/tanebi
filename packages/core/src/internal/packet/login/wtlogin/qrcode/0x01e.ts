import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvQrCode0x01e = Tlv.tagged([
    TlvVariableField('tgtgtKey', 'bytes', 'none', false),
], '0x1e');