import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSDeleteRequest } from '@/internal/packet/oidb/0x6d6';

export const GroupFSDeleteOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_3',
    (ctx, groupUin: number, fileId: string) =>
        GroupFSDeleteRequest.encode({
            delete: { groupUin, busId: 102, fileId },
        })
);
