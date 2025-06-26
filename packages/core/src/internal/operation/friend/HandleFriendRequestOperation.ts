import { defineOperation } from '@/internal/operation/OperationBase';
import { FriendRequestOperation, HandleFriendRequest } from '@/internal/packet/oidb/0xb5d_44';

export const HandleFriendRequestOperation = defineOperation(
    'OidbSvcTrpcTcp.0xb5d_44',
    (ctx, isAccept: boolean, uid: string) => HandleFriendRequest.encode({
        operation: isAccept ? FriendRequestOperation.Accept : FriendRequestOperation.Reject,
        uid,
    }),
);