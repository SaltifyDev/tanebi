import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x116 = Tlv.tagged([
    TlvScalarField('version', 'uint8'), // 0
    TlvScalarField('miscBitmap', 'uint32'), // 12058620
    TlvScalarField('subSigMap', 'uint32'), // appInfo.subSigMap
    TlvScalarField('appIdCount', 'uint8'), // 0
    TlvVariableField('appIdBytes', 'bytes', 'none', false), // empty
], '0x116');