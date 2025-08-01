import { Bot, BotMsgType, ctx, ImageSubType } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { DownloadPrivateImageOperation } from '@/internal/operation/highway/DownloadPrivateImageOperation';
import { DownloadGroupImageOperation } from '@/internal/operation/highway/DownloadGroupImageOperation';

export class BotMsgImage implements BotMsgType {
    private constructor(
        readonly fileId: string,
        readonly url: string,
        readonly width: number,
        readonly height: number,
        readonly subType: ImageSubType,
        readonly summary: string,
    ) {}

    static async create(data: IncomingSegmentOf<'image'>, msg: IncomingMessage, bot: Bot) {
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
                msg.type === MessageType.PrivateMessage ?
                    await bot[ctx].call(DownloadPrivateImageOperation, msg.senderUid!, data.indexNode) :
                    await bot[ctx].call(DownloadGroupImageOperation, msg.groupUin, data.indexNode),
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
                messageType === MessageType.PrivateMessage ?
                    await bot[ctx].call(DownloadPrivateImageOperation, 'u_B-xbHgFtPzMTjvfvZNVuqw', data.indexNode) :
                    await bot[ctx].call(DownloadGroupImageOperation, 0, data.indexNode),
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