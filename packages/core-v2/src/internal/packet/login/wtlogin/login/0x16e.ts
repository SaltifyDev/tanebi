import { Tlv, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x16e = Tlv.tagged([
    TlvVariableField('deviceName', 'string', 'none', false),
], '0x16e');