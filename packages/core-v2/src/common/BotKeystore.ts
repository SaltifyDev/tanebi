import { zBuffer, zIsoDateTime } from '@/util/serialize';
import { randomBytes } from 'node:crypto';
import z from 'zod';

export const zBotKeystore = z.object({
    uin: z.number(),
    uid: z.string().optional(),
    passwordMd5: z.string(),
    stub: z.object({
        randomKey: zBuffer,
        tgtgtKey: zBuffer,
    }),
    session: z.object({
        a2: zBuffer,
        d2: zBuffer,
        d2Key: zBuffer,
        a1: zBuffer.optional(),
        sessionDate: zIsoDateTime,
        qrSign: zBuffer.optional(),
        qrString: z.string().optional(),
        qrUrl: z.string().optional(),
        exchangeKey: zBuffer.optional(),
        keySign: zBuffer.optional(),
        unusualSign: zBuffer.optional(),
        unusualCookies: z.string().optional(),
        captchaUrl: z.string().optional(),
        newDeviceVerifyUrl: z.string().optional(),
        captcha: z.tuple([z.string(), z.string(), z.string()]).optional(),
        noPicSig: zBuffer.optional(),
        sequence: z.number(),
    }),
});

export type BotKeystore = z.infer<typeof zBotKeystore>;
export type BotKeystoreSerialized = z.input<typeof zBotKeystore>;

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

export function serializeKeystore(data: BotKeystore): BotKeystoreSerialized {
    return zBotKeystore.encode(data);
}

export function deserializeKeystore(data: BotKeystoreSerialized): BotKeystore {
    return zBotKeystore.decode(data);
}
