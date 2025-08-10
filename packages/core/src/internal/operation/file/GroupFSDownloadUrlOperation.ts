import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D6 } from '@/internal/packet/oidb/0x6d6';


export const GroupFSDownloadUrlOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_2',
    (ctx, groupUin: number, fileId: string) => GroupFS6D6.encodeDownload(groupUin, fileId),
    (ctx, payload) => GroupFS6D6.decodeDownload(payload)
);
