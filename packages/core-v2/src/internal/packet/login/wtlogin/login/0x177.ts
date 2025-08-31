import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x177 = Tlv.tagged([
    TlvScalarField('field0', 'uint8'), // 1
    TlvScalarField('buildTime', 'uint32'), // 0
    TlvVariableField('wtLoginSdk', 'string', 'uint16', false), // appInfo.WtLoginSdk
], '0x177');