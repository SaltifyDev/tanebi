import { BotFriendMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingPrivateMessage, ReplyInfo } from '@/internal/message/outgoing';
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
        this.segments.push((async () => {
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
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatImage: uploadResp.upload?.compatQMsg?.length
                    ? NotOnlineImageElement.decode(uploadResp.upload.compatQMsg)
                    : undefined,
            };
        })());
    }

    override async record(data: Buffer, duration: number): Promise<void> {
        this.segments.push((async () => {
            const recordMeta = getGeneralMetadata(data);
            this.bot[log].emit('trace', 'PrivateMessageBuilder', `Prepare to upload record ${JSON.stringify(recordMeta)}`);
            const uploadResp = await this.bot[ctx].call(UploadPrivateRecordOperation, this.friendUid, recordMeta, duration);
            await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
            return {
                type: 'record',
                msgInfo: uploadResp.upload!.msgInfo!,
            };
        })());
    }

    override forward(packMsg: (p: ForwardedMessagePacker) => void | Promise<void>) {
        this.segments.push((async () => {
            const packer = new ForwardedMessagePacker(this.bot);
            await packMsg(packer);
            return await packer.pack();
        })());
    }

    override async build(clientSequence: number): Promise<OutgoingPrivateMessage> {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.friendUin,
            targetUid: this.friendUid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: await Promise.all(this.segments),
            reply: this.replyInfo,
            repliedClientSequence: this.repliedClientSequence,
        };
    }
}
