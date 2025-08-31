import { SignProvider } from '@/common';
import { z } from 'zod';

const UrlSignResult = z.object({
    value: z.object({
        sign: z.string(),
        token: z.string(),
        extra: z.string(),
    }),
});

/**
 * Create a sign provider that fetches sign information from the given URL.
 * @param signApiUrl The URL to fetch sign information from
 * @returns The sign provider
 */
export function UrlSignProvider(signApiUrl: string): SignProvider {
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
