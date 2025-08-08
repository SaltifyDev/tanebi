import { Tlv, TlvScalarField } from '@/internal/util/tlv';

export const TlvLogin0x100 = Tlv.tagged([
    TlvScalarField('dbBufVersion', 'uint16'), // 0; originally 0x1
    TlvScalarField('ssoVersion', 'uint32'), // 5
    TlvScalarField('appId', 'uint32'),
    TlvScalarField('subAppId', 'uint32'),
    TlvScalarField('appClientVersion', 'uint32'),
    TlvScalarField('mainSigMap', 'uint32'),
], '0x100');