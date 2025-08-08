import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TlvLogin0x11a = Tlv.tagged([
    TlvScalarField('faceId', 'uint16'),
    TlvScalarField('age', 'uint8'),
    TlvScalarField('gender', 'uint8'),
    TlvVariableField('nickname', 'string', 'uint8', false),
], '0x11a');