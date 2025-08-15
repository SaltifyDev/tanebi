import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchFriendRequests, FetchFriendRequestsResponse } from '@/internal/packet/oidb/0x5cf_11';

export const FetchFriendRequestsOperation = defineOperation(
    'OidbSvcTrpcTcp.0x5cf_11',
    (ctx, count: number, startIndex?: number) => FetchFriendRequests.encode({
        version: 1,
        type: 6,
        selfUid: ctx.keystore.uid,
        startIndex: startIndex,
        reqNum: count,
        getFlag: 2,
        startTime: 0,
        needCommFriend: 1,
        field22: 1,
    }),
    (ctx, payload) => FetchFriendRequestsResponse.decodeBodyOrThrow(payload).info.requests,
);