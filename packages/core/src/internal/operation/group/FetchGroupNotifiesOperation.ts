import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchGroupNotifies, FetchGroupNotifiesResponse } from '@/internal/packet/oidb/0x10c0';

export const FetchGroupNotifiesOperation = defineOperation(
    'OidbSvcTrpcTcp.0x10c0_1',
    (ctx, count: number = 20, nextSequence?: bigint) => FetchGroupNotifies.encode({ count, nextSequence }),
    (ctx, payload) => FetchGroupNotifiesResponse.decodeBodyOrThrow(payload).requests,
);