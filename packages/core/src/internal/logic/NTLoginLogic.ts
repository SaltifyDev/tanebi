import { LogicBase } from '@/internal/logic/LogicBase';
import { SsoNTEasyLogin } from '@/internal/packet/login/ntlogin/SsoNTEasyLogin';
import { SsoNTLoginBase, SsoNTLoginWrapper } from '@/internal/packet/login/ntlogin/SsoNTLoginBase';
import { SsoNTLoginResponse } from '@/internal/packet/login/ntlogin/SsoNTLoginResponse';
import { aesGcmEncrypt } from '@/internal/util/crypto/aes';

export class NTLoginLogic extends LogicBase {
    buildNTLoginPacket(body: Buffer) {
        return SsoNTLoginWrapper.encode({
            sign: this.ctx.keystore.session.keySign,
            gcmCalc: aesGcmEncrypt(SsoNTLoginBase.encode({
                header: {
                    uin: { uin: this.ctx.keystore.uin.toString() },
                    system: {
                        os: this.ctx.appInfo.Os,
                        deviceName: this.ctx.deviceInfo.deviceName,
                        type: this.ctx.appInfo.NTLoginType,
                        guid: this.ctx.deviceInfo.guid,
                    },
                    version: {
                        kernelVersion: this.ctx.deviceInfo.kernelVersion,
                        appId: this.ctx.appInfo.AppId,
                        packageName: this.ctx.appInfo.PackageName,
                    },
                    cookie: { cookie: this.ctx.keystore.session.unusualCookies },
                },
                body: SsoNTEasyLogin.encode({
                    tempPassword: body,
                    captcha: this.ctx.keystore.session.captcha ? {
                        ticket: this.ctx.keystore.session.captcha[0],
                        randStr: this.ctx.keystore.session.captcha[1],
                        aid: this.ctx.keystore.session.captcha[2],
                    } : undefined,
                }),
            }), this.ctx.keystore.session.exchangeKey!),
            type: 1,
        });
    }

    decodeNTLoginPacket(packet: Buffer) {
        const gcmCalc = SsoNTLoginWrapper.decode(packet).gcmCalc;
        if (!gcmCalc) {
            return undefined;
        }
        const base = SsoNTLoginBase.decode(aesGcmEncrypt(gcmCalc, this.ctx.keystore.session.exchangeKey!));
        return {
            header: base.header,
            body: base.body ? SsoNTLoginResponse.decode(base.body) : undefined,
        };
    }
}