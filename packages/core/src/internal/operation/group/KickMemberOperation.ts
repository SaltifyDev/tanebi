import { defineOperation } from '@/internal/operation/OperationBase';
import { KickMember } from '@/internal/packet/oidb/0x8a0_1';

export const KickMemberOperation = defineOperation(
    'OidbSvcTrpcTcp.0x8a0_1',
    (ctx, groupUin: number, memberUin: string, rejectSubsequentRequests: boolean, reason: string) =>
        KickMember.encode({
            groupUin,
            memberUin,
            rejectSubsequentRequests,
            reason,
        }),
);