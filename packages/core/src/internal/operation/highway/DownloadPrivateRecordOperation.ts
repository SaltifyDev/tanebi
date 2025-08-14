import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadPrivateRecord, DownloadPrivateRecordResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModelInput } from '@/internal/util/pb';

export const DownloadPrivateRecordOperation = defineOperation(
    'OidbSvcTrpcTcp.0x126d_200',
    (ctx, node: InferProtoModelInput<typeof IndexNode.fields>) => DownloadPrivateRecord.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 1,
                businessType: 3,
                sceneType: 1,
                c2cExt: {
                    accountType: 2,
                    uid: ctx.keystore.uid,
                }
            },
            client: { agentType: 2 },
        },
        download: { node }
    }),
    (ctx, payload) => {
        const response = DownloadPrivateRecordResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);