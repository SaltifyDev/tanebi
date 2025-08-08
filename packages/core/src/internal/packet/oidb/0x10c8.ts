import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export enum GroupRequestOperation {
    Accept = 1,
    Reject = 2,
    Ignore = 3,
}

export const HandleGroupRequestGeneral = ProtoMessage.of({
    operation: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(2, () => ({
        sequence: ProtoField(1, ScalarType.UINT64),
        eventType: ProtoField(2, ScalarType.UINT32),
        groupUin: ProtoField(3, ScalarType.UINT32),
        message: ProtoField(4, ScalarType.STRING),
    })),
});

export const HandleGroupRequest = new OidbSvcContract(0x10c8, 1, HandleGroupRequestGeneral.fields);

export const HandleGroupFilteredRequest = new OidbSvcContract(0x10c8, 2, HandleGroupRequestGeneral.fields);