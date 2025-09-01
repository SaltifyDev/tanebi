import { BotSignProvider } from '@/common';
import { z } from 'zod';

const UrlSignResult = z.object({
    value: z.object({
        sign: z.string(),
        token: z.string(),
        extra: z.string(),
    }),
});

/**
 * 从指定的 URL 获取签名信息的签名接口。
 * @param signApiUrl 签名 API 的 URL
 * @returns 签名接口
 */
export function UrlSignProvider(signApiUrl: string): BotSignProvider {
    return {
        async sign(cmd, src, seq) {
            const res = await fetch(signApiUrl, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cmd,
                    src: src.toString('hex'),
                    seq,
                }),
            });
            const json = await res.json();
            const signBody = UrlSignResult.parse(json).value;
            return ({
                sign: Buffer.from(signBody.sign, 'hex'),
                token: Buffer.from(signBody.token, 'hex'),
                extra: Buffer.from(signBody.extra, 'hex'),
            });
        }
    };
}
