import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D8 } from '@/internal/packet/oidb/0x6d8';


export const GroupFSListOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d8_1',
    (ctx, groupUin: number, targetDirectory: string, startIndex: number) => GroupFS6D8.encodeList(groupUin, targetDirectory, startIndex),
    (ctx, payload) => GroupFS6D8.decodeList(payload)
);
