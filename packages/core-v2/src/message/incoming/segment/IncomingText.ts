import { MessageParsingContext } from '@/message/incoming/context';

/**
 * 接收的文本消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingText {
    constructor(
        /**
         * 文本内容
         */
        readonly text: string
    ) {}

    toPreviewString(): string {
        return this.text;
    }

    static tryParse(context: MessageParsingContext): IncomingText | null {
        const textElement = context.peek().text;
        if (!textElement || textElement.attr6Buf?.length) return null;
        context.consume();
        return new IncomingText(textElement.textMsg ?? '');
    }
}
