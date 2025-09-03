import { defineOperation } from '@/internal/operation';
import { DownloadGroupImage, DownloadGroupImageResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModelInput } from '@/internal/util/pb';

export const DownloadGroupImageOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11c4_200',
    (ctx, node: InferProtoModelInput<typeof IndexNode.fields>) => DownloadGroupImage.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 1,
                sceneType: 2,
                groupExt: {},
            },
            client: { agentType: 2 },
        },
        download: { node },
    }),
    (ctx, payload) => {
        const response = DownloadGroupImageResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);