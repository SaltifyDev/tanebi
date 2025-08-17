import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSRenameRequest } from '@/internal/packet/oidb/0x6d6';

export const GroupFSRenameOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_4',
    (ctx, groupUin: number, fileId: string, parentDirectory: string, newFileName: string) =>
        GroupFSRenameRequest.encode({
            rename: {
                groupUin,
                busId: 102,
                fileId,
                parentDirectory,
                newFileName
            }
        }),
);