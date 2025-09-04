import { MessageParsingContext } from '@/message/incoming/context';

/**
 * 接收的提及（@）消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingMention {
    constructor(
        /**
         * 被提及的用户名称
         */
        readonly name: string,

        /**
         * 被提及的用户 uin，为 0 表示 `@全体成员`
         */
        readonly uin: number
    ) {}

    toPreviewString(): string {
        return this.name;
    }

    static tryParse(context: MessageParsingContext): IncomingMention | null {
        const textElement = context.peek().text;
        if (!textElement?.attr6Buf || textElement.attr6Buf.length < 11) return null;
        context.consume();
        const mentionedUin = textElement.attr6Buf.readUInt32BE(7);
        return new IncomingMention(textElement.textMsg ?? `@${mentionedUin}`, mentionedUin);
    }
}
