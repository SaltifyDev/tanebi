import { LargeFaceInfo } from '@/internal/packet/message/face/LargeFaceInfo';
import { SmallExtraFaceInfo } from '@/internal/packet/message/face/SmallExtraFaceInfo';
import { MessageParsingContext } from '@/message/incoming/context';

/**
 * 接收的表情消息段
 */
export class IncomingFace {
    constructor(
        /**
         * 表情 ID
         */
        readonly faceId: number,

        /**
         * 表情的显示文本
         */
        readonly displayText: string,

        /**
         * 是否为“大表情”，即 QQ 的“超级表情”
         */
        readonly isLarge: boolean
    ) {}

    toPreviewString() {
        return this.displayText;
    }

    static tryParse(context: MessageParsingContext): IncomingFace | null {
        const elem = context.peek();

        if (elem.face?.old) {
            context.consume();
            return new IncomingFace(
                elem.face.index ?? 0,
                context.bot.getFaceDetail(String(elem.face.index))?.qDes ?? '[表情]',
                false
            );
        }

        if (elem.common?.serviceType === 37) {
            context.consume();
            const largeFaceInfo = LargeFaceInfo.decode(elem.common.pbElement);
            return new IncomingFace(
                largeFaceInfo.faceId,
                largeFaceInfo.preview,
                true
            );
        }

        if (elem.common?.serviceType === 33) {
            context.consume();
            const smallFaceExtraInfo = SmallExtraFaceInfo.decode(elem.common.pbElement);
            return new IncomingFace(
                smallFaceExtraInfo.faceId,
                smallFaceExtraInfo.text1 ?? smallFaceExtraInfo.text2 ?? '[表情]',
                false
            );
        }

        return null;
    }
}
