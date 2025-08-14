import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchGroupExtraInfoRequest, FetchGroupExtraInfoResponse } from '@/internal/packet/oidb/0x88d_0';

export const FetchGroupExtraInfoOperation = defineOperation(
    'OidbSvcTrpcTcp.0x88d_0',
    (ctx, groupUin: number) => FetchGroupExtraInfoRequest.encode({
        random: Math.floor(Math.random() * 0xFFFFFFFF),
        config: {
            groupUin,
            flags: {
                latestMessageSeq: true,
            },
        },
    }),
    (ctx, payload) => FetchGroupExtraInfoResponse.decodeBodyOrThrow(payload).info.results,
);