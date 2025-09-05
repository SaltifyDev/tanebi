// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Bot } from '@/index';
import { type CommonElement } from '@/internal/packet/message/elem/CommonElement';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { type InferProtoModel } from '@/internal/util/pb';
import { MessageParsingContext } from '@/message/incoming/context';

type CommonElem = InferProtoModel<typeof CommonElement.fields>;

/**
 * 接收的语音消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingRecord {
    /** @hidden */
    constructor(
        /**
         * 语音的文件 ID，可用于下载语音
         * @see {@link Bot.getResourceTempUrl}
         */
        readonly fileId: string,

        /**
         * 语音的时长（秒）
         */
        readonly duration: number
    ) {}

    toPreviewString(): string {
        return '[语音]';
    }

    private static verifyCommonElem(common: CommonElem): boolean {
        return common.serviceType === 48 && (common.businessType === 22 || common.businessType === 12);
    }

    /** @hidden */
    static tryParse(context: MessageParsingContext): IncomingRecord | null {
        const elem = context.peek();
        if (elem.common && this.verifyCommonElem(elem.common)) {
            const msgInfo = MsgInfo.decode(elem.common.pbElement);
            if (msgInfo.msgInfoBody.length > 0) {
                context.consume();
                const msgInfoBody = msgInfo.msgInfoBody[0];
                return new IncomingRecord(msgInfoBody.index?.fileUuid ?? '', msgInfoBody.index?.info?.time ?? 0);
            }
        }
        return null;
    }
}
