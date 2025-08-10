import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFS6D6 } from '@/internal/packet/oidb/0x6d6';


export const GroupFSUploadOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_0',
    (
        ctx,
        groupUin: number,
        targetDirectory: string,
        fileName: string,
        fileSize: bigint,
        fileSha1: Buffer,
        fileMd5: Buffer
    ) => GroupFS6D6.encodeUpload(groupUin, targetDirectory, fileName, fileSize, fileSha1, fileMd5),
    (ctx, payload) => GroupFS6D6.decodeUpload(payload)
);
