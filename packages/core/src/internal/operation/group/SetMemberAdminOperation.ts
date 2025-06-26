import { defineOperation } from '@/internal/operation/OperationBase';
import { SetMemberAdmin } from '@/internal/packet/oidb/0x1096_1';

export const SetMemberAdminOperation = defineOperation(
    'OidbSvcTrpcTcp.0x1096_1',
    (ctx, groupUin: number, memberUid: string, isSet: boolean) =>
        SetMemberAdmin.encode({
            groupUin,
            memberUid,
            isSet,
        }),
);