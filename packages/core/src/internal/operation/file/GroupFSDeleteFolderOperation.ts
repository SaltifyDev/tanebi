import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSDeleteFolderRequest, GroupFSDeleteFolderResponse } from '@/internal/packet/oidb/0x6d7';

export const GroupFSDeleteFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_1',
    (ctx, groupUin: number, folderId: string) => GroupFSDeleteFolderRequest.encode({
        delete: { groupUin, folderId },
    }),
    (ctx, payload) => {
        const body = GroupFSDeleteFolderResponse.decodeBodyOrThrow(payload).delete!;
        return { code: body.retcode, message: body.retMsg };
    }
);
