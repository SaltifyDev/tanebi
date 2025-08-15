import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const FetchFriendRequests = new OidbSvcContract(0x5cf, 11, {
    version: ProtoField(1, ScalarType.INT32),
    type: ProtoField(3, ScalarType.INT32),
    selfUid: ProtoField(4, ScalarType.STRING),
    startIndex: ProtoField(5, ScalarType.INT32),
    reqNum: ProtoField(6, ScalarType.INT32),
    getFlag: ProtoField(8, ScalarType.INT32),
    startTime: ProtoField(9, ScalarType.INT32),
    needCommFriend: ProtoField(12, ScalarType.INT32),
    field22: ProtoField(22, ScalarType.INT32),
});

export const FetchFriendRequestsResponse = new OidbSvcContract(0x5cf, 11, {
    info: ProtoField(3, () => ({
        requests: ProtoField(7, () => ({
            targetUid: ProtoField(1, ScalarType.STRING),
            sourceUid: ProtoField(2, ScalarType.STRING),
            state: ProtoField(3, ScalarType.UINT32),
            timestamp: ProtoField(4, ScalarType.UINT32),
            comment: ProtoField(5, ScalarType.STRING),
            source: ProtoField(6, ScalarType.STRING),
            sourceId: ProtoField(7, ScalarType.UINT32),
            subSourceId: ProtoField(8, ScalarType.UINT32),
        }), false, true),
    })),
});