import { defineOperation } from '@/internal/operation/OperationBase';
import { SetMemberSpecialTitle } from '@/internal/packet/oidb/0x8fc_2';

export const SetMemberSpecialTitleOperation = defineOperation(
    'OidbSvcTrpcTcp.0x8fc_2',
    (ctx, groupUin: number, targetUid: string, specialTitle: string,) => 
        SetMemberSpecialTitle.encode({
            groupUin,
            body: {
                targetUid,
                specialTitle,
                expireTime: -1,
                specialTitle2: specialTitle,
            }
        }),
);