import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const HandleFilteredFriendRequest = new OidbSvcContract(0xd72, 0, {
    selfUid: ProtoField(1, ScalarType.STRING),
    requestUid: ProtoField(2, ScalarType.STRING),
});