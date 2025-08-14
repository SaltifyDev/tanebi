import { BotMsgType } from '.';
import { Bot } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingSegmentOf } from '@/internal/message/incoming';

export class BotMsgVideo implements BotMsgType {
    private constructor(
        readonly fileId: string,
        readonly width: number,
        readonly height: number,
        readonly fileSize: number,
        readonly url: string,
    ) {}

    static async create(data: IncomingSegmentOf<'video'>, bot: Bot) {
        return new BotMsgVideo(
            data.indexNode!.fileUuid!,
            data.indexNode.info?.width ?? 0,
            data.indexNode.info?.height ?? 0,
            data.indexNode.info?.fileSize ?? 0,
            await bot.getResourceDownloadUrl(data.indexNode.fileUuid!),
        );
    }

    static async createForward(data: IncomingSegmentOf<'video'>, messageType: MessageType, bot: Bot) {
        return new BotMsgVideo(
            data.indexNode!.fileUuid!,
            data.indexNode.info?.width ?? 0,
            data.indexNode.info?.height ?? 0,
            data.indexNode.info?.fileSize ?? 0,
            await bot.getResourceDownloadUrl(data.indexNode.fileUuid!),
        );
    }

    toPreviewString(): string {
        return `[视频 ${this.width}x${this.height}]`;
    }
}