import { defineOperation } from '@/internal/operation/OperationBase';
import { MuteAllMembers } from '@/internal/packet/oidb/0x89a_0';

export const MuteAllMembersOperation = defineOperation(
    'OidbSvcTrpcTcp.0x89a_0',
    (ctx, groupUin: number, duration: number) => MuteAllMembers.encode({
        groupUin,
        body: { duration },
    }),
);