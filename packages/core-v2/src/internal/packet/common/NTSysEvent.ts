import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const NTSysEvent = ProtoMessage.of({
    ip: ProtoField(1, ScalarType.STRING),
    sid: ProtoField(2, ScalarType.INT64),
    sub: ProtoField(3, () => ({
        state: ProtoField(2, ScalarType.INT64),
        field3: ProtoField(3, ScalarType.INT32),
        field4: ProtoField(4, ScalarType.INT64),
        uin: ProtoField(5, ScalarType.INT64),
        flag: ProtoField(6, ScalarType.INT32),
        on: ProtoField(7, ScalarType.INT32),
        groupUin: ProtoField(8, ScalarType.UINT32),
    })),
});