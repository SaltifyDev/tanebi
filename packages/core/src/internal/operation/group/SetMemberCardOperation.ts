import { defineOperation } from '@/internal/operation/OperationBase';
import { SetMemberCard } from '@/internal/packet/oidb/0x8fc_3';

export const SetMemberCardOperation = defineOperation(
    'OidbSvcTrpcTcp.0x8fc_3',
    (ctx, groupUin: number, targetUid: string, card: string) => 
        SetMemberCard.encode({
            groupUin,
            body: {
                targetUid,
                card,
            }
        }),
);