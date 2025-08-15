import { defineOperation } from '@/internal/operation/OperationBase';
import { HandleFilteredFriendRequest } from '@/internal/packet/oidb/0xd72_0';

export const AcceptFilteredFriendRequestOperation = defineOperation(
    'OidbSvcTrpcTcp.0xd72_0',
    (ctx, uid: string) => HandleFilteredFriendRequest.encode({
        selfUid: ctx.keystore.uid,
        requestUid: uid,
    }),
);