import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSCreateFolderRequest, GroupFSCreateFolderResponse } from '@/internal/packet/oidb/0x6d7';

export const GroupFSCreateFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_0',
    (ctx, groupUin: number, name: string) => GroupFSCreateFolderRequest.encode({
        create: { groupUin, rootDirectory: '/', folderName: name },
    }),
    (ctx, payload) => {
        const body = GroupFSCreateFolderResponse.decodeBodyOrThrow(payload);
        return { code: body.create?.retcode ?? -1, message: body.create?.retMsg };
    }
);
