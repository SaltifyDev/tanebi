import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D6 } from '@/internal/packet/oidb/0x6d6';


export const GroupFSDeleteOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_3',
    (ctx, groupUin: number, fileId: string) => GroupFS6D6.encodeDelete(groupUin, fileId)
);
