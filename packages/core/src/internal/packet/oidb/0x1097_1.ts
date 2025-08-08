import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const LeaveGroup = new OidbSvcContract(0x1097, 1, {
    groupUin: ProtoField(1, ScalarType.UINT32),
});
