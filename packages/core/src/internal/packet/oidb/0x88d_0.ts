import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const FetchGroupExtraInfoRequest = new OidbSvcContract(0x88d, 0, {
    random: ProtoField(1, ScalarType.UINT32),
    config: ProtoField(2, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        flags: ProtoField(2, () => ({
            latestMessageSeq: ProtoField(22, ScalarType.BOOL),
            // other fields...
        })),
    })),
});

export const FetchGroupExtraInfoResponse = new OidbSvcContract(0x88d, 0, {
    info: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        results: ProtoField(3, () => ({
            latestMessageSeq: ProtoField(22, ScalarType.UINT32),
            // other fields...
        })),
    })),
});