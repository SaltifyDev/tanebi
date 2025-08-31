import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoInfoSyncPush = ProtoMessage.of({
    result: ProtoField(1, ScalarType.UINT32),
    errMsg: ProtoField(2, ScalarType.STRING, true),
    pushFlag: ProtoField(3, ScalarType.UINT32),
    pushSeq: ProtoField(4, ScalarType.UINT32),
    retryFlag: ProtoField(5, ScalarType.UINT32),
    groupSystemNotifications: ProtoField(7, () => ({
        notifications: ProtoField(3, () => ({
            groupCode: ProtoField(3, ScalarType.UINT32),
            startSeq: ProtoField(4, ScalarType.UINT32),
            endSeq: ProtoField(5, ScalarType.UINT32),
        }), false, true),
    })),
});