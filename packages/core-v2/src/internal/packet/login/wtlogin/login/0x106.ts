import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x106 = Tlv.tagged([
    TlvVariableField('a1', 'bytes', 'none', false),
], '0x106');