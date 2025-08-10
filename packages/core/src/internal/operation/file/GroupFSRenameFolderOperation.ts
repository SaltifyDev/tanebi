import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D7 } from '@/internal/packet/oidb/0x6d7';


export const GroupFSRenameFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_2',
    (ctx, groupUin: number, folderId: string, newFolderName: string) => GroupFS6D7.encodeRenameFolder(groupUin, folderId, newFolderName),
    (ctx, payload) => GroupFS6D7.decodeRenameFolder(payload)
);
