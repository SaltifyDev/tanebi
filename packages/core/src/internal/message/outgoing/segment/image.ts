import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { InferProtoModelInput } from '@/internal/util/pb';

export const imageBuilder = defineOutgoing(
    'image',
    (segment: {
        msgInfo: InferProtoModelInput<typeof MsgInfo.fields>,
        compatImage?: InferProtoModelInput<typeof NotOnlineImageElement.fields>,
        compatFace?: InferProtoModelInput<typeof CustomFaceElement.fields>,
    }) => {
        return [
            {
                notOnlineImage: segment.compatImage,
                customFace: segment.compatFace,
            },
            {
                common: {
                    serviceType: 48,
                    pbElement: MsgInfo.encode(segment.msgInfo),
                    businessType: 20,
                }
            }
        ];
    }
);