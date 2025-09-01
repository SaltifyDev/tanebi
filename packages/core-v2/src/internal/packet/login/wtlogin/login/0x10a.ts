import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x10a = Tlv.tagged([
    TlvVariableField('a2', 'bytes', 'none', false),
], '0x10a');