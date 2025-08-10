import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D7 } from '@/internal/packet/oidb/0x6d7';


export const GroupFSDeleteFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_1',
    (ctx, groupUin: number, folderId: string) => GroupFS6D7.encodeDeleteFolder(groupUin, folderId),
    (ctx, payload) => GroupFS6D7.decodeDeleteFolder(payload)
);
