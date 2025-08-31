import { defineOperation } from '@/internal/operation';
import {
    TransEmp31,
    TransEmp31_TlvPack,
    TransEmp31Response,
    TransEmp31Response_TlvPack,
} from '@/internal/packet/login/wtlogin/TransEmp31';
import { TlvQrCode0x0d1_Response, TlvQrCode0x0d1Body } from '@/internal/packet/login/wtlogin/qrcode/0x0d1';

const FetchQrCodeSubCommand = 0x31;
const BUF_0x30_0x01 = Buffer.from([0x30, 0x01]);

export const FetchQrCodeOperation = defineOperation(
    'wtlogin.trans_emp',
    (ctx) => ctx.wtLoginLogic.buildWtLoginPacket(
        'wtlogin.trans_emp',
        ctx.wtLoginLogic.buildTransEmpBody(FetchQrCodeSubCommand, TransEmp31.encode({
            appId: ctx.appInfo.AppId,
            uin: BigInt(ctx.keystore.uin),
            tgt: ctx.keystore.session.tgt,
            field4: 0,
            field5: 0,
            tlvPack: TransEmp31_TlvPack.pack({
                '0x16': {
                    field0: 0,
                    appId: ctx.appInfo.AppId,
                    appIdQrCode: ctx.appInfo.SubAppId,
                    guid: ctx.deviceInfo.guid,
                    packageName: ctx.appInfo.PackageName,
                    ptVersion: ctx.appInfo.PtVersion,
                    packageName2: ctx.appInfo.PackageName,
                },
                '0x1b': {
                    micro: 0,
                    version: 0,
                    size: 3,
                    margin: 4,
                    dpi: 72,
                    ecLevel: 2,
                    hint: 2,
                    field7: 0,
                },
                '0x1d': {
                    field0: 1,
                    miscBitmap: ctx.appInfo.MainSigMap,
                    field2: 0,
                    field3: 0,
                },
                '0x33': { guid: ctx.deviceInfo.guid },
                '0x35': { ptOsVersion: ctx.appInfo.SsoVersion },
                '0x66': { ptOsVersion: ctx.appInfo.SsoVersion },
                '0xd1': {
                    body: TlvQrCode0x0d1Body.encode({
                        system: {
                            os: ctx.appInfo.Os,
                            name: ctx.deviceInfo.deviceName,
                        },
                        type: BUF_0x30_0x01,
                    }),
                },
            }),
        }))),
    (ctx, payload) => {
        const resolvedWtLogin = ctx.wtLoginLogic.decodeWtLoginPacket(payload);
        if (resolvedWtLogin.commandId !== 2066) {
            throw new Error(`Unexpected command id: ${resolvedWtLogin.commandId}`);
        }
        const resolvedTransEmp = ctx.wtLoginLogic.unwrapTransEmpPacket(resolvedWtLogin.decrypted);
        if (resolvedTransEmp.subCommand !== FetchQrCodeSubCommand) {
            throw new Error(`Unexpected sub command: ${resolvedTransEmp.subCommand}`);
        }
        const transEmp31 = TransEmp31Response.decode(resolvedTransEmp.data);
        const tlvPack = TransEmp31Response_TlvPack.unpack(transEmp31.tlvPack);
        const tlvQrCode0xd1Resp = TlvQrCode0x0d1_Response.decode(tlvPack['0xd1']!.body);
        return {
            qrCode: tlvPack['0x17']!.qrCode,
            expiration: tlvPack['0x1c']!.expirationInSec,
            url: tlvQrCode0xd1Resp.url,
            qrSig: tlvQrCode0xd1Resp.qrSig,
            signature: transEmp31.signature,
        };
    },
);