/**
 * 签名接口。
 */
export interface BotSignProvider {
    /**
     * 签名方法，实现这一方法以提供签名。
     */
    sign(cmd: string, src: Buffer, seq: number): PromiseLike<SignResult | undefined>;
}

export interface SignResult {
    sign: Buffer;
    token: Buffer;
    extra: Buffer;
}

