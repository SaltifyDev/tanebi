import { MessageParsingContext } from '@/message/incoming/context';

/**
 * 接收的文本消息段
 */
export class IncomingText {
    constructor(
        readonly text: string
    ) {}

    static tryParse(context: MessageParsingContext): IncomingText | null {
        const textElement = context.next().text;
        if (
            !textElement || textElement.attr6Buf?.length
        ) return context.pushBackAndReturn(null);
        return new IncomingText(textElement.textMsg ?? '');
    }
}
