import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const RoutingHead = ProtoMessage.of({
    fromUin: ProtoField(1, ScalarType.UINT32),
    fromUid: ProtoField(2, ScalarType.STRING, true),
    fromAppId: ProtoField(3, ScalarType.UINT32),
    fromInstId: ProtoField(4, ScalarType.UINT32),
    toUin: ProtoField(5, ScalarType.UINT32),
    toUid: ProtoField(6, ScalarType.STRING, true),
    c2cExt: ProtoField(7, () => ({
        friendName: ProtoField(6, ScalarType.STRING, true)
    }), true),
    groupExt: ProtoField(8, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        memberName: ProtoField(4, ScalarType.STRING),
        unknown5: ProtoField(5, ScalarType.UINT32),
        groupName: ProtoField(7, ScalarType.STRING),
    }), true),
});