import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadPrivateVideo, DownloadPrivateVideoResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModelInput } from '@/internal/util/pb';

export const DownloadPrivateVideoOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11e9_200',
    (ctx, node: InferProtoModelInput<typeof IndexNode.fields>) => DownloadPrivateVideo.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 2,
                sceneType: 1,
                c2cExt: {
                    accountType: 2,
                    uid: ctx.keystore.uid,
                }
            },
            client: { agentType: 2 },
        },
        download: { node },
    }),
    (ctx, payload) => {
        const response = DownloadPrivateVideoResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);