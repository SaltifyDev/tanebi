import { BotFriendMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingPrivateMessage, OutgoingSegmentOf, ReplyInfo } from '@/internal/message/outgoing';
import { getImageMetadata } from '@/internal/util/media/image';
import { ForwardedMessagePacker, rawMessage } from '@/message';
import { Bot, ctx, log } from '@/index';
import { rawElems } from '@/internal/message/incoming';
import { randomInt } from 'crypto';
import { getGeneralMetadata } from '@/internal/util/media/common';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { UploadPrivateRecordOperation } from '@/internal/operation/highway/UploadPrivateRecordOperation';
import { UploadPrivateImageOperation } from '@/internal/operation/highway/UploadPrivateImageOperation';

export class PrivateMessageBuilder extends AbstractMessageBuilder {
    replyInfo?: ReplyInfo;
    repliedClientSequence?: number;

    constructor(protected readonly friendUin: number, protected readonly friendUid: string, bot: Bot) {
        super(bot);
    }

    reply(message: BotFriendMessage) {
        this.replyInfo = {
            sequence: message.sequence,
            senderUin: this.friendUin,
            senderUid: this.friendUid,
            messageUid: message.messageUid,
            elements: message[rawMessage][rawElems],
        };
        this.repliedClientSequence = message[rawMessage].clientSequence;
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.bot[log].emit('trace', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.bot[ctx].call(
            UploadPrivateImageOperation,
            this.friendUid,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary
        );
        await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            compatImage: uploadResp.upload?.compatQMsg?.length
                ? NotOnlineImageElement.decode(uploadResp.upload.compatQMsg)
                : undefined,
        });
    }

    override async record(data: Buffer, duration: number): Promise<void> {
        const recordMeta = getGeneralMetadata(data);
        this.bot[log].emit('trace', 'PrivateMessageBuilder', `Prepare to upload record ${JSON.stringify(recordMeta)}`);
        const uploadResp = await this.bot[ctx].call(UploadPrivateRecordOperation, this.friendUid, recordMeta, duration);
        await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
        this.segments.push({
            type: 'record',
            msgInfo: uploadResp.upload!.msgInfo!,
        });
    }

    override async forward(
        packMsg: (p: ForwardedMessagePacker) => void | Promise<void>
    ): Promise<OutgoingSegmentOf<'forward'>> {
        const packer = new ForwardedMessagePacker(this.bot);
        await packMsg(packer);
        const pack = await packer.pack();
        this.segments.push(pack);
        return pack;
    }

    override build(clientSequence: number): OutgoingPrivateMessage {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.friendUin,
            targetUid: this.friendUid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: this.segments,
            reply: this.replyInfo,
            repliedClientSequence: this.repliedClientSequence,
        };
    }
}
