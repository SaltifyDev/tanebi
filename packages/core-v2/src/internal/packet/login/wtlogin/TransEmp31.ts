import { TlvQrCode0x016 } from '@/internal/packet/login/wtlogin/qrcode/0x016';
import { TlvQrCode0x017 } from '@/internal/packet/login/wtlogin/qrcode/0x017';
import { TlvQrCode0x01b } from '@/internal/packet/login/wtlogin/qrcode/0x01b';
import { TlvQrCode0x01c } from '@/internal/packet/login/wtlogin/qrcode/0x01c';
import { TlvQrCode0x01d } from '@/internal/packet/login/wtlogin/qrcode/0x01d';
import { TlvQrCode0x033 } from '@/internal/packet/login/wtlogin/qrcode/0x033';
import { TlvQrCode0x035 } from '@/internal/packet/login/wtlogin/qrcode/0x035';
import { TlvQrCode0x066 } from '@/internal/packet/login/wtlogin/qrcode/0x066';
import { TlvQrCode0x0d1 } from '@/internal/packet/login/wtlogin/qrcode/0x0d1';
import { PackedTlv, Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/tlv';

export const TransEmp31 = Tlv.plain([
    TlvScalarField('appId', 'uint32'),
    TlvScalarField('uin', 'uint64'),
    TlvVariableField('a2', 'bytes', 'none', false),
    TlvScalarField('field4', 'uint8'), // 0
    TlvScalarField('field5', 'uint16'), // 0
    TlvVariableField('tlvPack', 'bytes', 'none', false),
]);

export const TransEmp31_TlvPack = PackedTlv.fromCollection([
    TlvQrCode0x016,
    TlvQrCode0x01b,
    TlvQrCode0x01d,
    TlvQrCode0x033,
    TlvQrCode0x035,
    TlvQrCode0x066,
    TlvQrCode0x0d1,
]);

export const TransEmp31Response = Tlv.plain([
    TlvScalarField('dummyByte', 'uint8'),
    TlvVariableField('signature', 'bytes', 'uint16', false),
    TlvVariableField('tlvPack', 'bytes', 'none', false),
]);

export const TransEmp31Response_TlvPack = PackedTlv.fromCollection([
    TlvQrCode0x017,
    TlvQrCode0x01c,
    TlvQrCode0x0d1,
]);