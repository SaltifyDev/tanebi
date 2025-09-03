import { defineOperation } from '@/internal/operation';
import { DownloadGroupVideo, DownloadGroupVideoResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModelInput } from '@/internal/util/pb';

export const DownloadGroupVideoOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11ea_200',
    (ctx, node: InferProtoModelInput<typeof IndexNode.fields>) => DownloadGroupVideo.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 2,
                sceneType: 2,
                groupExt: {},
            },
            client: { agentType: 2 },
        },
        download: { node },
    }),
    (ctx, payload) => {
        const response = DownloadGroupVideoResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);