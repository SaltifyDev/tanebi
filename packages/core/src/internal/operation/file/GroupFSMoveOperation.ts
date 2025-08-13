import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSMoveRequest } from '@/internal/packet/oidb/0x6d6';

export const GroupFSMoveOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_5',
    (ctx, groupUin: number, fileId: string, parentDirectory: string, targetDirectory: string) =>
        GroupFSMoveRequest.encode({
            move: { groupUin, appId: 7, busId: 102, fileId, parentDirectory, targetDirectory },
        }),
);
