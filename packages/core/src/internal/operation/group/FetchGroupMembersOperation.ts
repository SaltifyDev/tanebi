import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchGroupMembers, FetchGroupMembersResponse } from '@/internal/packet/oidb/0xfe7_3';

/**
 * This is a paginated operation to fetch friends.
 * Consider using stable API unless you know what you are doing.
 */
export const FetchGroupMembersOperation = defineOperation(
    'OidbSvcTrpcTcp.0xfe7_3',
    (ctx, groupUin: number, token?: string) => FetchGroupMembers.encode({
        groupUin,
        queried: {
            memberName: true,
            memberCard: true,
            level: true,
            specialTitle: true,
            joinTimestamp: true,
            lastMsgTimestamp: true,
            shutUpEndTimestamp: true,
            permission: true,
        },
        token,
    }),
    (ctx, payload) => FetchGroupMembersResponse.decodeBodyOrThrow(payload),
);