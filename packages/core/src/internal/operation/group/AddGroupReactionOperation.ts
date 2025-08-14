import { defineOperation } from '@/internal/operation/OperationBase';
import { AddGroupReactionRequest, AddGroupReactionResponse, ReactionType } from '@/internal/packet/oidb/0x9082';

export const AddGroupReactionOperation = defineOperation(
    'OidbSvcTrpcTcp.0x9082_1',
    (ctx, groupUin: number, sequence: number, code: string, type: ReactionType) =>
        AddGroupReactionRequest.encode({
            groupUin,
            sequence,
            code,
            type,
        }),
    (ctx, payload) => AddGroupReactionResponse.decodeBodyOrThrow(payload),
);