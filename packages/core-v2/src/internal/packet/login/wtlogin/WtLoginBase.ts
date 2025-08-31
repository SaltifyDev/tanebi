import { TlvScalarField, TlvVariableField } from '@/internal/util/tlv/serialize';
import { Tlv } from '@/internal/util/tlv';

export const WtLoginResponseBase = Tlv.plain([
    TlvScalarField('internalLength', 'uint16'),
    TlvScalarField('version', 'uint16'),
    TlvScalarField('commandId', 'uint16'),
    TlvScalarField('sequence', 'uint16'),
    TlvScalarField('uin', 'uint32'),
    TlvScalarField('flag', 'uint8'),
    TlvScalarField('retryTime', 'uint16'),
    TlvVariableField('encryptedData_0x03', 'bytes', 'none', false),
]);