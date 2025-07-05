import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export enum FriendRequestOperation {
    Accept = 3,
    Reject = 5,
}

export const HandleFriendRequest = new OidbSvcContract(0xb5d, 44, {
    operation: ProtoField(1, ScalarType.UINT32),
    uid: ProtoField(2, ScalarType.STRING),
});
