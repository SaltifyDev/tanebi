import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x142 = Tlv.tagged([
    TlvScalarField('version', 'uint16'), // 0
    TlvVariableField('packageName', 'string', 'uint16', false), // appInfo.packageName
], '0x142');