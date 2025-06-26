import { defineOperation } from '@/internal/operation/OperationBase';
import { SendGrayTipPoke } from '@/internal/packet/oidb/0xed3_1';

export const SendGrayTipPokeOperation = defineOperation(
    'OidbSvcTrpcTcp.0xed3_1',
    (ctx, uin: number, groupUin?: number, friendUin?: number) =>
        SendGrayTipPoke.encode({
            uin,
            groupUin,
            friendUin,
            ext: 0,
        }),
);