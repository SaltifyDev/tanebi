import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const FetchFriendFilteredRequests = new OidbSvcContract(0xd69, 0, {
    field1: ProtoField(1, ScalarType.UINT32), // 1
    field2: ProtoField(2, () => ({
        count: ProtoField(1, ScalarType.UINT32),
    })),
});

export const FetchFriendFilteredRequestsResponse = new OidbSvcContract(0xd69, 1, {
    info: ProtoField(2, () => ({
        requests: ProtoField(1, () => ({
            sourceUid: ProtoField(1, ScalarType.STRING),
            sourceNickname: ProtoField(2, ScalarType.STRING),
            comment: ProtoField(5, ScalarType.STRING),
            source: ProtoField(6, ScalarType.STRING),
            warningInfo: ProtoField(7, ScalarType.STRING),
            timestamp: ProtoField(8, ScalarType.UINT32),
        }), false, true),
    })),
});