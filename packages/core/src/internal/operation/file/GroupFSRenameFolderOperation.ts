import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSRenameFolderRequest, GroupFSRenameFolderResponse } from '@/internal/packet/oidb/0x6d7';

export const GroupFSRenameFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_2',
    (ctx, groupUin: number, folderId: string, newFolderName: string) => GroupFSRenameFolderRequest.encode({
        rename: { groupUin, folderId, newFolderName },
    }),
    (ctx, payload) => {
        const body = GroupFSRenameFolderResponse.decodeBodyOrThrow(payload).rename!;
        return { code: body.retcode, message: body.retMsg };
    }
);
