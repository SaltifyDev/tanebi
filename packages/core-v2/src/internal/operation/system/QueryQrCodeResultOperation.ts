import { BotQrCodeState } from '@/common';
import { defineOperation } from '@/internal/operation';
import {
    TransEmp12Response,
    TransEmp12Response_Confirmed,
    TransEmp12Response_Confirmed_TlvPack,
} from '@/internal/packet/login/wtlogin/TransEmp12';
import { SmartBuffer } from 'smart-arraybuffer';

export const QueryQrCodeResultSubCommand = 0x12;

export type QueryQrCodeResultCallResult = {
    confirmed: true,
    a1: Buffer,
    noPicSig: Buffer,
    tgtgtKey: Buffer,
} | {
    confirmed: false,
    state: BotQrCodeState,
}

export const QueryQrCodeResultOperation = defineOperation(
    'wtlogin.trans_emp',
    (ctx) => ctx.wtLoginLogic.buildWtLoginPacket(
        'wtlogin.trans_emp',
        ctx.wtLoginLogic.buildTransEmpBody(QueryQrCodeResultSubCommand, new SmartBuffer()
            .writeUInt32BE(ctx.appInfo.AppId)
            .writeUInt16BE(ctx.keystore.session.qrSign!.length)
            .writeBuffer(ctx.keystore.session.qrSign!)
            .writeBigUInt64BE(BigInt(ctx.keystore.uin))
            .writeUInt32BE(0)
            .writeUInt8(0)
            .writeUInt8(0x03)
            .toBuffer()
        )),
    (ctx, payload): QueryQrCodeResultCallResult => {
        const resolvedWtLogin = ctx.wtLoginLogic.decodeWtLoginPacket(payload);
        if (resolvedWtLogin.commandId !== 2066) {
            throw new Error(`意外的 command id: ${resolvedWtLogin.commandId}`);
        }
        const resolvedTransEmp = ctx.wtLoginLogic.unwrapTransEmpPacket(resolvedWtLogin.decrypted);
        if (resolvedTransEmp.subCommand !== QueryQrCodeResultSubCommand) {
            throw new Error(`意外的 sub command: ${resolvedTransEmp.subCommand}`);
        }
        const transEmp12 = TransEmp12Response.decode(resolvedTransEmp.data);
        if (transEmp12.qrCodeState === BotQrCodeState.Confirmed) {
            const { tlvPack } = TransEmp12Response_Confirmed.decode(transEmp12.remaining);
            const resolvedTlvPack = TransEmp12Response_Confirmed_TlvPack.unpack(tlvPack);
            return {
                confirmed: true,
                a1: resolvedTlvPack['0x18']!.a1,
                noPicSig: resolvedTlvPack['0x19']!.noPicSig,
                tgtgtKey: resolvedTlvPack['0x1e']!.tgtgtKey,
            };
        } else {
            return {
                confirmed: false,
                state: transEmp12.qrCodeState,
            };
        }
    }
);