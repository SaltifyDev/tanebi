import { PackedTlv, Tlv, TlvFixedBytesField, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';
import { TlvQrCode0x018 } from '@/internal/packet/login/wtlogin/qrcode/0x018';
import { TlvQrCode0x019 } from '@/internal/packet/login/wtlogin/qrcode/0x019';
import { TlvQrCode0x01e } from '@/internal/packet/login/wtlogin/qrcode/0x01e';

export enum TransEmp12_QrCodeState {
    Confirmed = 0,
    CodeExpired = 17,
    WaitingForScan = 48,
    WaitingForConfirm = 53,
    Canceled = 54,
}

export const TransEmp12Response = Tlv.plain([
    TlvScalarField('qrCodeState', 'uint8'),
    TlvVariableField('remaining', 'bytes', 'none', false),
]);

export const TransEmp12Response_Confirmed = Tlv.plain([
    TlvFixedBytesField('misc', 12),
    TlvVariableField('tlvPack', 'bytes', 'none', false),
]);

export const TransEmp12Response_Confirmed_TlvPack = PackedTlv.fromCollection([
    TlvQrCode0x018,
    TlvQrCode0x019,
    TlvQrCode0x01e,
]);