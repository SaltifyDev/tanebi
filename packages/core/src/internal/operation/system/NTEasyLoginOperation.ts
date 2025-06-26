import { defineOperation } from '@/internal/operation/OperationBase';
import { NTLoginErrorCode } from '@/internal/packet/login/ntlogin/SsoNTLoginBase';

export type NTEasyLoginResult = {
    success: true;
    tgt: Buffer;
    d2: Buffer;
    d2Key: Buffer;
    tempPassword: Buffer;
    sessionDate: Date;
} | {
    success: false;
    errorCode: number;
    unusual?: {
        sign: Buffer;
        cookies: string;
    };
}

export const NTEasyLoginOperation = defineOperation(
    'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLogin',
    (ctx) => ctx.ntLoginLogic.buildNTLoginPacket(ctx.keystore.session.tempPassword!),
    (ctx, payload): NTEasyLoginResult => {
        const response = ctx.ntLoginLogic.decodeNTLoginPacket(payload);
        if (!response) {
            return { success: false, errorCode: NTLoginErrorCode.Unknown };
        }

        if (response.header?.error && !response.body?.credentials) {
            return {
                success: false,
                errorCode: response.header.error.errorCode ?? NTLoginErrorCode.Unknown,
                unusual: {
                    sign: response.body!.unusual!.sig!,
                    cookies: response.header.cookie!.cookie!,
                }
            };
        } else {
            return {
                success: true,
                tgt: response.body!.credentials!.tgt!,
                d2: response.body!.credentials!.d2!,
                d2Key: response.body!.credentials!.d2Key!,
                tempPassword: response.body!.credentials!.tempPassword!,
                sessionDate: new Date(),
            };
        }
    }
);