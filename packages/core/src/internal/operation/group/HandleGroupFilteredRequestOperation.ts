import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { GroupRequestOperation, HandleGroupFilteredRequest } from '@/internal/packet/oidb/0x10c8';

export const HandleGroupFilteredRequestOperation = defineOperation(
    'OidbSvcTrpcTcp.0x10c8_2',
    (
        ctx,
        groupUin: number,
        sequence: bigint,
        eventType: GroupNotifyType,
        operation: GroupRequestOperation,
        message: string
    ) => HandleGroupFilteredRequest.encode({
        operation,
        body: {
            sequence,
            eventType,
            groupUin,
            message,
        },
    }),
);