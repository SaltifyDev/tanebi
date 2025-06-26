import { defineOperation } from '@/internal/operation/OperationBase';
import { SetGroupName } from '@/internal/packet/oidb/0x89a_15';

export const SetGroupNameOperation = defineOperation(
    'OidbSvcTrpcTcp.0x89a_15',
    (ctx, groupUin: number, name: string) => SetGroupName.encode({ groupUin, body: { name } })
);