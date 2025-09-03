import { MessageParsingContext } from '@/message/incoming/context';

/**
 * 接收的文本消息段
 */
export class IncomingText {
    constructor(
        /**
         * 文本内容
         */
        readonly text: string
    ) {}

    static tryParse(context: MessageParsingContext): IncomingText | null {
        const textElement = context.peek().text;
        if (!textElement || textElement.attr6Buf?.length) return null;
        context.consume();
        return new IncomingText(textElement.textMsg ?? '');
    }
}
