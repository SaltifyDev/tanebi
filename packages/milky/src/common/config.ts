import { z } from 'zod';

export const zProfile = z.object({
    name: z.string(),
});
export type Profile = z.infer<typeof zProfile>;

export const defaultProfile: Profile = {
    name: 'default',
};

export const zConfig = z.object({
    logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
    signApiUrl: z.string().url()
        .transform((url) => (url.endsWith('/') ? url.substring(0, url.length - 1) : url)),
    reportSelfMessage: z.boolean(),
    enableNtSilk: z.boolean(),
    onForcedOffline: z.enum(['exit', 'reLogin', 'noAction']),
    milky: z.object({
        http: z.object({
            host: z.string(),
            port: z.number().int().min(1).max(65535),
            prefix: z.string(),
        }),
        webhook: z.object({
            urls: z.array(z.string().url()),
        }),
    }),
});

export type Config = z.infer<typeof zConfig>

export const exampleConfig: Config = {
    logLevel: 'info',
    signApiUrl: 'https://sign.lagrangecore.org/api/sign/30366',
    reportSelfMessage: false,
    enableNtSilk: false,
    onForcedOffline: 'noAction',
    milky: {
        http: {
            host: '0.0.0.0',
            port: 3000,
            prefix: '/',
        },
        webhook: {
            urls: []
        }
    }
};