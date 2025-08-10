import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D7 } from '@/internal/packet/oidb/0x6d7';


export const GroupFSCreateFolderOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d7_0',
    (ctx, groupUin: number, name: string) => GroupFS6D7.encodeCreateFolder(groupUin, name),
    (ctx, payload) => GroupFS6D7.decodeCreateFolder(payload)
);
