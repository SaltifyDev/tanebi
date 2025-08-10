import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D6 } from '@/internal/packet/oidb/0x6d6';


export const GroupFSMoveOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_5',
    (ctx, groupUin: number, fileId: string, parentDirectory: string, targetDirectory: string) => GroupFS6D6.encodeMove(groupUin, fileId, parentDirectory, targetDirectory)
);
