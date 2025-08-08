import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x143 = Tlv.tagged([
    TlvVariableField('d2', 'bytes', 'none', false),
], '0x143');