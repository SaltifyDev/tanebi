import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSDownloadUrlRequest, GroupFSDownloadUrlResponse } from '@/internal/packet/oidb/0x6d6';

export const GroupFSDownloadUrlOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d6_2',
    (ctx, groupUin: number, fileId: string) =>
        GroupFSDownloadUrlRequest.encode({
            download: {
                groupUin,
                appId: 7,
                busId: 102,
                fileId,
            },
        }),
    (ctx, payload) => {
        const d = GroupFSDownloadUrlResponse.decodeBodyOrThrow(payload).download!;
        return `https://${d.downloadDns}/ftn_handler/${d.downloadUrl.toString('hex')}/?fname=`;
    }
);
