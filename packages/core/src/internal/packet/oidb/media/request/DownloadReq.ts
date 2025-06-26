import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const DownloadReq = ProtoMessage.of({
    node: ProtoField(1, () => IndexNode.fields, true, false),
    download: ProtoField(2, () => ({
        pic: ProtoField(1, () => ({}), true, false),
        video: ProtoField(2, () => ({
            busiType: ProtoField(1, ScalarType.UINT32, false, false),
            sceneType: ProtoField(2, ScalarType.UINT32, false, false),
            subBusiType: ProtoField(3, ScalarType.UINT32, false, false),
        }), true, false),
        ptt: ProtoField(3, () => ({}), true, false),
    }), true, false),
});
