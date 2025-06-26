import { MessageType } from '@/internal/message';
import { defineOperation } from '@/internal/operation/OperationBase';
import { DownloadVideo, DownloadVideoResponse } from '@/internal/packet/oidb/media/Action';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { InferProtoModel } from '@tanebijs/protobuf';

export const DownloadVideoOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11e9_200',
    (ctx, senderUid: string, node: InferProtoModel<typeof IndexNode.fields>, msgType: MessageType) => DownloadVideo.encode({
        reqHead: {
            common: {
                requestId: msgType === MessageType.GroupMessage ? 3 : 34,
                command: 200,
            },
            scene: {
                requestType: 2,
                businessType: 2,
                sceneType: 1,
                c2cExt: {
                    accountType: 2,
                    uid: senderUid,
                }
            },
            client: { agentType: 2 },
        },
        download: { node },
    }),
    (ctx, payload) => {
        const response = DownloadVideoResponse.decodeBodyOrThrow(payload).download;
        if (!response) {
            throw new Error('Invalid response');
        }
        return `https://${response.info?.domain}${response.info?.urlPath}${response.rKeyParam}`;
    }
);