import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { GroupRequestOperation, HandleGroupRequest } from '@/internal/packet/oidb/0x10c8';

export const HandleGroupRequestOperation = defineOperation(
    'OidbSvcTrpcTcp.0x10c8_1',
    (
        ctx,
        groupUin: number,
        sequence: bigint,
        eventType: GroupNotifyType,
        operation: GroupRequestOperation,
        message: string
    ) => HandleGroupRequest.encode({
        operation,
        body: {
            sequence,
            eventType,
            groupUin,
            message,
        },
    }),
);