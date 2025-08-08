import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadGroupRecord, DownloadGroupRecordResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModel } from '@/internal/util/pb';

export const DownloadGroupRecordOperation = defineOperation(
    'OidbSvcTrpcTcp.0x126e_200',
    (ctx, groupUin: number, node: InferProtoModel<typeof IndexNode.fields>) => DownloadGroupRecord.encode({
        reqHead: {
            common: {
                requestId: 4,
                command: 200,
            },
            scene: {
                requestType: 1,
                businessType: 3,
                sceneType: 2,
                groupExt: { groupUin },
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