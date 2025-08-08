import { defineOutgoing } from '@/internal/message/outgoing/segment-base';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { InferProtoModelInput } from '@/internal/util/pb';

export const recordBuilder = defineOutgoing(
    'record',
    (segment: {
        msgInfo: InferProtoModelInput<typeof MsgInfo.fields>,
    }) => {
        return {
            common: {
                serviceType: 48,
                pbElement: MsgInfo.encode(segment.msgInfo),
                businessType: 22,
            }
        };
    }
);