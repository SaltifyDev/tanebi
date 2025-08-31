import { defineOperation } from '@/internal/operation';
import { Login, LoginResponse, LoginResponse_TlvPack, LoginState } from '@/internal/packet/login/wtlogin/Login';
import { BUF0 } from '@/internal/util/constants';
import { TlvLogin0x119_DecryptedPack } from '@/internal/packet/login/wtlogin/login/0x119';
import { decryptTea, encryptTea } from '@/internal/util/crypto/tea';
import { TlvLogin0x543Body } from '@/internal/packet/login/wtlogin/login/0x543';
import { TlvLogin0x114_TlvBody } from '@/internal/packet/login/wtlogin/login/0x144';
import { SmartBuffer } from 'smart-arraybuffer';

const BUF12 = Buffer.alloc(12);

export type WtLoginCallResult = {
    success: true,
    uid: string,
    session: {
        d2Key: Buffer,
        tgt: Buffer,
        d2: Buffer,
        tempPassword: Buffer,
        sessionDate: Date,
    },
} | {
    success: false,
    state: LoginState,
    tag?: string,
    message?: string,
    raw: Buffer,
};

export const WtLoginOperation = defineOperation(
    'wtlogin.login',
    (ctx) => ctx.wtLoginLogic
        .buildWtLoginPacket('wtlogin.login', new SmartBuffer()
            .writeUInt16BE(0x09) // command
            .writeBuffer(Login.pack({
                '0x106': { tempPassword: ctx.keystore.session.tempPassword! },
                '0x144': {
                    tgtgtEncrypted: encryptTea(TlvLogin0x114_TlvBody.pack({
                        '0x16e': { deviceName: ctx.deviceInfo.deviceName },
                        '0x147': {
                            appId: ctx.appInfo.AppId,
                            ptVersion: ctx.appInfo.PtVersion,
                            packageName: ctx.appInfo.PackageName,
                        },
                        '0x128': {
                            field0: 0,
                            guidNew: 0,
                            guidAvailable: 1,
                            guidChanged: 0,
                            guidFlag: 0,
                            os: ctx.appInfo.Os,
                            guid: ctx.deviceInfo.guid,
                            brand: '',
                        },
                        '0x124': {
                            empty: BUF12,
                        },
                    }), ctx.keystore.stub.tgtgtKey),
                },
                '0x116': {
                    version: 0,
                    miscBitmap: 12058620,
                    subSigMap: ctx.appInfo.SubSigMap,
                    appIdCount: 0,
                    appIdBytes: BUF0,
                },
                '0x142': {
                    version: 0,
                    packageName: ctx.appInfo.PackageName,
                },
                '0x145': { guid: ctx.deviceInfo.guid },
                '0x018': {
                    pingVersion: 0,
                    ssoVersion: 5,
                    field2: 0,
                    appClientVersion: 8001,
                    uin: ctx.keystore.uin,
                    field5: 0,
                    field6: 0,
                },
                '0x141': {
                    field0: 'Unknown',
                    networkType: 0,
                    apn: '',
                },
                '0x177': {
                    field0: 1,
                    buildTime: 0,
                    wtLoginSdk: ctx.appInfo.WtLoginSdk,
                },
                '0x191': { k: 0 },
                '0x100': {
                    dbBufVersion: 0,
                    ssoVersion: 5,
                    appId: ctx.appInfo.AppId,
                    subAppId: ctx.appInfo.SubAppId,
                    appClientVersion: ctx.appInfo.AppClientVersion,
                    mainSigMap: ctx.appInfo.MainSigMap,
                },
                '0x107': {
                    picType: 1,
                    capType: 0,
                    picSize: 0x0d,
                    retType: 1,
                },
                '0x318': {},
                '0x16a': { noPicSig: ctx.keystore.session.noPicSig! },
                '0x166': { imageType: 5 },
                '0x521': {
                    productType: 0x13,
                    productDesc: 'basicim',
                },
            }))
            .toBuffer()),
    function (ctx, data): WtLoginCallResult {
        const { commandId, decrypted } = ctx.wtLoginLogic.decodeWtLoginPacket(data);
        if (commandId !== 2064) {
            throw new Error(`Unexpected command id: ${commandId}`);
        }
        const { state, tlvPack: tlvPackEncoded } = LoginResponse.decode(decrypted);
        const unpacked = LoginResponse_TlvPack.unpack(tlvPackEncoded);
        if (state === LoginState.Success) {
            const unpacked0x119 = TlvLogin0x119_DecryptedPack.unpack(
                decryptTea(unpacked['0x119']!.encryptedTlv, ctx.keystore.stub.tgtgtKey));
            return {
                success: true,
                uid: TlvLogin0x543Body.decode(unpacked0x119['0x543']!.protoBody).layer1.layer2.uid,
                session: {
                    d2Key: unpacked0x119['0x305']!.d2Key,
                    tgt: unpacked0x119['0x10a']!.tgt,
                    d2: unpacked0x119['0x143']!.d2,
                    tempPassword: unpacked0x119['0x106']!.tempPassword,
                    sessionDate: new Date(),
                },
            };
        } else {
            return {
                success: false,
                state,
                tag: unpacked['0x146']?.tag,
                message: unpacked['0x146']?.message,
                raw: decrypted,
            };
        }
    },
);