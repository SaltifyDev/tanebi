import { Bot, BotMsgType, ImageSubType } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingSegmentOf } from '@/internal/message/incoming';

export class BotMsgImage implements BotMsgType {
    private constructor(
        readonly fileId: string,
        readonly url: string,
        readonly width: number,
        readonly height: number,
        readonly subType: ImageSubType,
        readonly summary: string,
    ) {}

    static async create(data: IncomingSegmentOf<'image'>, bot: Bot) {
        if (data.url) {
            return new BotMsgImage(
                data.url,
                data.url,
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        if (data.indexNode) {
            return new BotMsgImage(
                data.indexNode.fileUuid!,
                await bot.getResourceDownloadUrl(data.indexNode.fileUuid!),
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        throw new Error('Unexpected input data');
    }

    static async createForward(data: IncomingSegmentOf<'image'>, messageType: MessageType, bot: Bot) {
        if (data.url) {
            return new BotMsgImage(
                data.url,
                data.url,
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        if (data.indexNode) {
            return new BotMsgImage(
                data.indexNode.fileUuid!,
                await bot.getResourceDownloadUrl(data.indexNode.fileUuid!),
                data.width,
                data.height,
                data.subType,
                data.summary,
            );
        }

        throw new Error('Unexpected input data');
    }

    toPreviewString() {
        return this.summary;
    }
}

export { ImageSubType } from '@/internal/message/incoming/segment/image';