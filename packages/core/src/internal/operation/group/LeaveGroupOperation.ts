import { defineOperation } from '@/internal/operation/OperationBase';
import { LeaveGroup } from '@/internal/packet/oidb/0x1097_1';

export const LeaveGroupOperation = defineOperation(
    'OidbSvcTrpcTcp.0x1097_1',
    (ctx, groupUin: number) => LeaveGroup.encode({ groupUin }),
);