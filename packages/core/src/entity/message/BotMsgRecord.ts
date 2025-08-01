import { BotMsgType } from '.';
import { Bot, ctx } from '@/index';
import { MessageType } from '@/internal/message';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { DownloadPrivateRecordOperation } from '@/internal/operation/highway/DownloadPrivateRecordOperation';
import { DownloadGroupRecordOperation } from '@/internal/operation/highway/DownloadGroupRecordOperation';

export class BotMsgRecord implements BotMsgType {
    private constructor(
        readonly fileId: string,
        readonly duration: number,
        readonly url: string,
    ) {}

    static async create(data: IncomingSegmentOf<'record'>, msg: IncomingMessage, bot: Bot) {
        return new BotMsgRecord(
            data.indexNode!.fileUuid!,
            data.indexNode?.info?.time ?? 0,
            msg.type === MessageType.PrivateMessage ?
                await bot[ctx].call(DownloadPrivateRecordOperation, msg.senderUid!, data.indexNode) :
                await bot[ctx].call(DownloadGroupRecordOperation, msg.groupUin, data.indexNode),
        );
    }

    toPreviewString(): string {
        return `[语音 ${this.duration}s]`;
    }
}