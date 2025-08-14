import { BotMsgType } from '.';
import { Bot } from '@/index';
import { IncomingSegmentOf } from '@/internal/message/incoming';
export class BotMsgRecord implements BotMsgType {
    private constructor(
        readonly fileId: string,
        readonly duration: number,
        readonly url: string,
    ) {}

    static async create(data: IncomingSegmentOf<'record'>, bot: Bot) {
        return new BotMsgRecord(
            data.indexNode!.fileUuid!,
            data.indexNode?.info?.time ?? 0,
            await bot.getResourceDownloadUrl(data.indexNode.fileUuid!),
        );
    }

    toPreviewString(): string {
        return `[语音 ${this.duration}s]`;
    }
}