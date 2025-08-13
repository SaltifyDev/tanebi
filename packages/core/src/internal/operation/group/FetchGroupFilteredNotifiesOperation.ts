import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchGroupFilteredNotifies, FetchGroupFilteredNotifiesResponse } from '@/internal/packet/oidb/0x10c0';

export const FetchGroupFilteredNotifiesOperation = defineOperation(
    'OidbSvcTrpcTcp.0x10c0_2',
    (ctx, count: number = 20, nextSequence?: bigint) => FetchGroupFilteredNotifies.encode({ count, nextSequence }),
    (ctx, payload) => FetchGroupFilteredNotifiesResponse.decodeBodyOrThrow(payload).requests,
);