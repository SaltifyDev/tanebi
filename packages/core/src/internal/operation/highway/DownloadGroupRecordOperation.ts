import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadGroupRecord, DownloadGroupRecordResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModelInput } from '@/internal/util/pb';

export const DownloadGroupRecordOperation = defineOperation(
    'OidbSvcTrpcTcp.0x126e_200',
    (ctx, node: InferProtoModelInput<typeof IndexNode.fields>) => DownloadGroupRecord.encode({
        reqHead: {
            common: {
                requestId: 1,
                command: 200,
            },
            scene: {
                requestType: 1,
                businessType: 3,
                sceneType: 2,
                groupExt: {},
            },
            client: { agentType: 2 },
        },
        download: { node }
    }),
    (ctx, payload) => {
        const response = DownloadGroupRecordResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);