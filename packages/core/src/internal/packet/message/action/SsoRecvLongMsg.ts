import { LongMessageSettings } from '@/internal/packet/message/forward/LongMessageSettings';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoRecvLongMsg = ProtoMessage.of({
    info: ProtoField(1, () => ({
        uidInfo: ProtoField(1, () => ({
            uid: ProtoField(2, ScalarType.STRING),
        })),
        resId: ProtoField(2, ScalarType.STRING),
        isAcquire: ProtoField(3, ScalarType.BOOL),
    })),
    settings: ProtoField(15, () => LongMessageSettings.fields),
});

export const SsoRecvLongMsgResponse = ProtoMessage.of({
    result: ProtoField(1, () => ({
        payload: ProtoField(4, ScalarType.BYTES),
    })),
});