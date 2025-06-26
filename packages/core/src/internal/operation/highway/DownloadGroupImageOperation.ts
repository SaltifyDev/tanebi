import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadGroupImage, DownloadGroupImageResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModel } from '@tanebijs/protobuf';

export const DownloadGroupImageOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11c4_200',
    (ctx, groupUin: number, node: InferProtoModel<typeof IndexNode.fields>) => DownloadGroupImage.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 1,
                sceneType: 2,
                groupExt: { groupUin },
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