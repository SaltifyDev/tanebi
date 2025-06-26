import { defineOperation } from '@/internal/operation/OperationBase';
import { SendProfileLike } from '@/internal/packet/oidb/0x7e5_104';

export const SendProfileLikeOperation = defineOperation(
    'OidbSvcTrpcTcp.0x7e5_104',
    (ctx, targetUid: string, count: number) => SendProfileLike.encode({
        targetUid,
        field12: 71,
        count,
    }),
);