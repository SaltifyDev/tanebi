export interface SignProvider {
    sign(cmd: string, src: Buffer, seq: number): PromiseLike<SignResult | undefined>;
}

export interface SignResult {
    sign: Buffer;
    token: Buffer;
    extra: Buffer;
}

