import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoGetGroupMsg = ProtoMessage.of({
    groupInfo: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        startSequence: ProtoField(2, ScalarType.UINT32),
        endSequence: ProtoField(3, ScalarType.UINT32),
    })),
    filter: ProtoField(2, ScalarType.UINT32), // 1 for no filter, 2 for filter of only 10 msg within 3 days
});

export const SsoGetGroupMsgResponse = ProtoMessage.of({
    retcode: ProtoField(1, ScalarType.UINT32),
    errorMsg: ProtoField(2, ScalarType.STRING),
    body: ProtoField(3, () => ({
        retcode: ProtoField(1, ScalarType.UINT32),
        errorMsg: ProtoField(2, ScalarType.STRING),
        groupUin: ProtoField(3, ScalarType.UINT32),
        startSequence: ProtoField(4, ScalarType.UINT32),
        endSequence: ProtoField(5, ScalarType.UINT32),
        messages: ProtoField(6, ScalarType.BYTES, false, true),
    })),
});