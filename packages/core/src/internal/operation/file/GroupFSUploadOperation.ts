import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSUploadRequest, GroupFSUploadResponse } from '@/internal/packet/oidb/0x6d6';

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
    ) =>
        GroupFSUploadRequest.encode({
            upload: {
                groupUin,
                appId: 7,
                busId: 102,
                entrance: 6,
                targetDirectory,
                fileName,
                localDirectory: `/${fileName}`,
                fileSize,
                fileSha1,
                fileSha3: Buffer.alloc(0),
                fileMd5,
                field15: true,
            },
        }),
    (ctx, payload) => GroupFSUploadResponse.decodeBodyOrThrow(payload).upload!
);
