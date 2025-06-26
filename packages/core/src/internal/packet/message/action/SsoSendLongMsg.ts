import { LongMessageSettings } from '@/internal/packet/message/forward/LongMessageSettings';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SsoSendLongMsg = ProtoMessage.of({
    info: ProtoField(2, () => ({
        type: ProtoField(1, ScalarType.UINT32),
        uidInfo: ProtoField(2, () => ({
            uid: ProtoField(2, ScalarType.STRING),
        })),
        groupUin: ProtoField(3, ScalarType.UINT32, true),
        payload: ProtoField(4, ScalarType.BYTES),
    })),
    settings: ProtoField(15, () => LongMessageSettings.fields),
});

export const SsoSendLongMsgResponse = ProtoMessage.of({
    result: ProtoField(2, () => ({
        resId: ProtoField(3, ScalarType.STRING),
    })),
});