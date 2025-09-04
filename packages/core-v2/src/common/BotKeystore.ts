import {
    BufferSerialized,
    DateSerialized,
    serializeBuffer,
    serializeDate,
    deserializeBuffer,
    deserializeDate,
} from '@/util/serialize';
import { randomBytes } from 'node:crypto';

/**
 * 登录 QQ 所需的密钥信息
 */
export interface BotKeystore {
    uin: number;
    uid?: string;
    passwordMd5: string;
    stub: {
        randomKey: Buffer;
        tgtgtKey: Buffer;
    };
    session: {
        a2: Buffer;
        d2: Buffer;
        d2Key: Buffer;
        a1?: Buffer;
        sessionDate: Date;
        qrSign?: Buffer;
        qrString?: string;
        qrUrl?: string;
        exchangeKey?: Buffer;
        keySign?: Buffer;
        unusualSign?: Buffer;
        unusualCookies?: string;
        captchaUrl?: string;
        newDeviceVerifyUrl?: string;
        captcha?: [string, string, string];
        noPicSig?: Buffer;
        sequence: number;
    };
}

/**
 * 生成新的密钥信息，用于二维码登录。
 */
export function newKeystore(): BotKeystore {
    return {
        uin: 0,
        passwordMd5: '',
        stub: {
            randomKey: randomBytes(16),
            tgtgtKey: Buffer.alloc(16),
        },
        session: {
            a2: Buffer.alloc(0),
            d2: Buffer.alloc(0),
            d2Key: Buffer.alloc(16),
            sessionDate: new Date(),
            sequence: 0,
        },
    };
}

export interface KeystoreSerialized {
    uin: number;
    uid?: string;
    passwordMd5: string;
    stub: {
        randomKey: BufferSerialized;
        tgtgtKey: BufferSerialized;
    };
    session: {
        a2: BufferSerialized;
        d2: BufferSerialized;
        d2Key: BufferSerialized;
        a1?: BufferSerialized;
        sessionDate: DateSerialized;
        qrSign?: BufferSerialized;
        qrString?: string;
        qrUrl?: string;
        exchangeKey?: BufferSerialized;
        keySign?: BufferSerialized;
        unusualSign?: BufferSerialized;
        unusualCookies?: string;
        captchaUrl?: string;
        newDeviceVerifyUrl?: string;
        captcha?: [string, string, string];
        noPicSig?: BufferSerialized;
        sequence: number;
    };
}

export function serializeKeystore(data: BotKeystore): KeystoreSerialized {
    return {
        uin: data.uin,
        uid: data.uid,
        passwordMd5: data.passwordMd5,
        stub: {
            randomKey: serializeBuffer(data.stub.randomKey)!,
            tgtgtKey: serializeBuffer(data.stub.tgtgtKey)!,
        },
        session: {
            a2: serializeBuffer(data.session.a2)!,
            d2: serializeBuffer(data.session.d2)!,
            d2Key: serializeBuffer(data.session.d2Key)!,
            a1: serializeBuffer(data.session.a1),
            sessionDate: serializeDate(data.session.sessionDate),
            qrSign: serializeBuffer(data.session.qrSign),
            qrString: data.session.qrString,
            qrUrl: data.session.qrUrl,
            exchangeKey: serializeBuffer(data.session.exchangeKey),
            keySign: serializeBuffer(data.session.keySign),
            unusualSign: serializeBuffer(data.session.unusualSign),
            unusualCookies: data.session.unusualCookies,
            captchaUrl: data.session.captchaUrl,
            newDeviceVerifyUrl: data.session.newDeviceVerifyUrl,
            captcha: data.session.captcha,
            noPicSig: serializeBuffer(data.session.noPicSig),
            sequence: data.session.sequence,
        },
    };
}

export function deserializeKeystore(data: KeystoreSerialized): BotKeystore {
    return {
        uin: data.uin,
        uid: data.uid,
        passwordMd5: data.passwordMd5,
        stub: {
            randomKey: deserializeBuffer(data.stub.randomKey)!,
            tgtgtKey: deserializeBuffer(data.stub.tgtgtKey)!,
        },
        session: {
            a2: deserializeBuffer(data.session.a2)!,
            d2: deserializeBuffer(data.session.d2)!,
            d2Key: deserializeBuffer(data.session.d2Key)!,
            a1: deserializeBuffer(data.session.a1),
            sessionDate: deserializeDate(data.session.sessionDate),
            qrSign: deserializeBuffer(data.session.qrSign),
            qrString: data.session.qrString,
            qrUrl: data.session.qrUrl,
            exchangeKey: deserializeBuffer(data.session.exchangeKey),
            keySign: deserializeBuffer(data.session.keySign),
            unusualSign: deserializeBuffer(data.session.unusualSign),
            unusualCookies: data.session.unusualCookies,
            captchaUrl: data.session.captchaUrl,
            newDeviceVerifyUrl: data.session.newDeviceVerifyUrl,
            captcha: data.session.captcha,
            noPicSig: deserializeBuffer(data.session.noPicSig),
            sequence: data.session.sequence,
        },
    };
}
