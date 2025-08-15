import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchFriendFilteredRequests, FetchFriendFilteredRequestsResponse } from '@/internal/packet/oidb/0xd69_0';

export const FetchFriendFilteredRequestsOperation = defineOperation(
    'OidbSvcTrpcTcp.0xd69_0',
    (ctx, count: number) => FetchFriendFilteredRequests.encode({
        field1: 1,
        field2: { count },
    }),
    (ctx, payload) => FetchFriendFilteredRequestsResponse.decodeBodyOrThrow(payload).info.requests,
);