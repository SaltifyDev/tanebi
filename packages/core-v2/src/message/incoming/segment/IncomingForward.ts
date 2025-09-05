// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Bot } from '@/index';
import { MessageParsingContext } from '@/message/incoming/context';
import { XMLParser } from 'fast-xml-parser';
import { inflateSync } from 'node:zlib';
import z from 'zod';

const ForwardXmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
});

const ForwardXmlSchema = z.object({
    msg: z.object({
        '@m_resid': z.string(),
        '@tSum': z.string(),
        item: z.object({
            title: z.array(
                z.object({
                    '@color': z.string(),
                    '#text': z.string(),
                })
            ),
        }),
    }),
});

/**
 * 接收的合并转发消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingForward {
    /** @hidden */
    constructor(
        /**
         * 合并转发的 ID，可用于获取转发内容
         * @see {@link Bot.getForwardedMessages}
         */
        readonly resId: string,

        /**
         * 合并转发的消息总数，若包含嵌套转发，则为所有转发的消息总数
         */
        readonly msgCount: number,

        /**
         * 合并转发的预览文本，通常是前 4 条消息的摘要
         */
        readonly previewText: string[],

        /**
         * 合并转发的原始 XML 数据
         */
        readonly rawXml: string
    ) {}

    toPreviewString(): string {
        return '[转发消息]';
    }

    /** @hidden */
    static tryParse(context: MessageParsingContext): IncomingForward | null {
        const elem = context.peek();
        if (elem.richMsg && elem.richMsg.serviceId === 35 && elem.richMsg.template1 !== undefined) {
            context.consume();
            const xml = inflateSync(elem.richMsg.template1.subarray(1)).toString('utf-8');
            const parsed = ForwardXmlSchema.parse(ForwardXmlParser.parse(xml)).msg;
            return new IncomingForward(
                parsed['@m_resid'],
                parseInt(parsed['@tSum']),
                parsed.item.title.filter((title) => title['@color'] === '#777777').map((title) => title['#text']),
                xml
            );
        }
        return null;
    }
}
