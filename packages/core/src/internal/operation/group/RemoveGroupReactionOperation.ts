import { defineOperation } from '@/internal/operation/OperationBase';
import { ReactionType, RemoveGroupReactionRequest, RemoveGroupReactionResponse } from '@/internal/packet/oidb/0x9082';

export const RemoveGroupReactionOperation = defineOperation(
    'OidbSvcTrpcTcp.0x9082_2',
    (ctx, groupUin: number, sequence: number, code: string, type: ReactionType) =>
        RemoveGroupReactionRequest.encode({
            groupUin,
            sequence,
            code,
            type,
        }),
    (ctx, payload) => RemoveGroupReactionResponse.decodeBodyOrThrow(payload),
);