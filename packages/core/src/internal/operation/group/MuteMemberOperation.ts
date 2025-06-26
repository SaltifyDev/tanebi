import { defineOperation } from '@/internal/operation/OperationBase';
import { MuteMember } from '@/internal/packet/oidb/0x1253_1';

export const MuteMemberOperation = defineOperation(
    'OidbSvcTrpcTcp.0x1253_1',
    (ctx, groupUin: number, targetUid: string, duration: number) => MuteMember.encode({
        groupUin,
        type: 1,
        body: { targetUid, duration },
    }),
);