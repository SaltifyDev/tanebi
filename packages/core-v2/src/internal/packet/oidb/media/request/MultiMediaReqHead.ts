import { CommonHead } from '@/internal/packet/oidb/media/CommonHead';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const MultiMediaReqHead = ProtoMessage.of({
    common: ProtoField(1, () => CommonHead.fields, true, false),
    scene: ProtoField(2, () => ({
        requestType: ProtoField(101, ScalarType.UINT32, false, false),
        businessType: ProtoField(102, ScalarType.UINT32, false, false),
        sceneType: ProtoField(200, ScalarType.UINT32, false, false),
        c2cExt: ProtoField(201, () => ({
            accountType: ProtoField(1, ScalarType.UINT32, false, false),
            uid: ProtoField(2, ScalarType.STRING, true, false),
        }), true, false),
        groupExt: ProtoField(202, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32, false, false),
        }), true, false),
    }), true, false),
    client: ProtoField(3, () => ({
        agentType: ProtoField(1, ScalarType.UINT32, false, false),
    }), true, false),
});
