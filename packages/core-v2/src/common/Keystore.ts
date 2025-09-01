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
 * 登录 QQ 所需的密钥信息。
 */
export interface Keystore {
    uin: number;

    uid?: string;

    passwordMd5: string;

    stub: {
        /**
         * 16 bytes, generated on instance creation
         */
        randomKey: Buffer;

        /**
         * 16 bytes, initially 0
         */
        tgtgtKey: Buffer;
    };

    session: {
        /**
         * 16 bytes, initially 0
         */
        d2Key: Buffer;

        /**
         * Initially empty
         */
        d2: Buffer;

        /**
         * Initially empty
         */
        tgt: Buffer;

        sessionDate: Date;

        /**
         * 24 bytes
         */
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

        tempPassword?: Buffer;

        /**
         * 16 bytes, may be from Tlv19, for Tlv16A
         */
        noPicSig?: Buffer;

        sequence: number;
    };
}

/**
 * 生成新的密钥信息，用于二维码登录。
 */
export function newKeystore(): Keystore {
    return {
        uin: 0,
        passwordMd5: '',
        stub: {
            randomKey: randomBytes(16),
            tgtgtKey: Buffer.alloc(16),
        },
        session: {
            d2Key: Buffer.alloc(16),
            d2: Buffer.alloc(0),
            tgt: Buffer.alloc(0),
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
        d2Key: BufferSerialized;
        d2: BufferSerialized;
        tgt: BufferSerialized;
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
        tempPassword?: BufferSerialized;
        noPicSig?: BufferSerialized;
        sequence: number;
    };
}

export function serializeKeystore(data: Keystore): KeystoreSerialized {
    return {
        uin: data.uin,
        uid: data.uid,
        passwordMd5: data.passwordMd5,
        stub: {
            randomKey: serializeBuffer(data.stub.randomKey)!,
            tgtgtKey: serializeBuffer(data.stub.tgtgtKey)!,
        },
        session: {
            d2Key: serializeBuffer(data.session.d2Key)!,
            d2: serializeBuffer(data.session.d2)!,
            tgt: serializeBuffer(data.session.tgt)!,
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
            tempPassword: serializeBuffer(data.session.tempPassword),
            noPicSig: serializeBuffer(data.session.noPicSig),
            sequence: data.session.sequence,
        },
    };
}

export function deserializeKeystore(data: KeystoreSerialized): Keystore {
    return {
        uin: data.uin,
        uid: data.uid,
        passwordMd5: data.passwordMd5,
        stub: {
            randomKey: deserializeBuffer(data.stub.randomKey)!,
            tgtgtKey: deserializeBuffer(data.stub.tgtgtKey)!,
        },
        session: {
            d2Key: deserializeBuffer(data.session.d2Key)!,
            d2: deserializeBuffer(data.session.d2)!,
            tgt: deserializeBuffer(data.session.tgt)!,
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
            tempPassword: deserializeBuffer(data.session.tempPassword),
            noPicSig: deserializeBuffer(data.session.noPicSig),
            sequence: data.session.sequence,
        },
    };
}
