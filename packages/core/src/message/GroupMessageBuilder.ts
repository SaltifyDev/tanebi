import { BotGroupMember, BotGroupMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingGroupMessage, OutgoingSegmentOf, ReplyInfo } from '@/internal/message/outgoing';
import { getImageMetadata } from '@/internal/util/media/image';
import { ForwardedMessagePacker, rawMessage } from '@/message';
import { Bot, ctx, log } from '@/index';
import { randomInt } from 'crypto';
import { getGeneralMetadata } from '@/internal/util/media/common';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { rawElems } from '@/internal/message/incoming';
import { UploadGroupRecordOperation } from '@/internal/operation/highway/UploadGroupRecordOperation';
import { UploadGroupImageOperation } from '@/internal/operation/highway/UploadGroupImageOperation';

export class GroupMessageBuilder extends AbstractMessageBuilder {
    replyInfo?: ReplyInfo;

    constructor(private readonly groupUin: number, bot: Bot) {
        super(bot);
    }

    /**
     * Mention a member in the group
     * @param member The member to mention
     */
    mention(member: BotGroupMember) {
        this.segments.push({
            type: 'mention',
            uin: member.uin,
            uid: member.uid,
            name: '@' + (member.card || member.nickname),
        });
    }

    /**
     * Mention all members in the group
     */
    mentionAll() {
        this.segments.push({
            type: 'mention',
            uin: 0,
            uid: '',
            name: '@全体成员',
        });
    }

    /**
     * Reply to a group message
     */
    reply(message: BotGroupMessage) {
        if (message.sender.group.uin !== this.groupUin) {
            throw new Error('Cannot reply to a message from another group');
        }
        this.replyInfo = {
            sequence: message.sequence,
            senderUin: message.sender.uin,
            senderUid: message.sender.uid,
            messageUid: message.messageUid,
            elements: message[rawMessage][rawElems],
        };
    }

    override async image(data: Buffer, subType?: ImageSubType, summary?: string): Promise<void> {
        const imageMeta = getImageMetadata(data);
        this.bot[log].emit('trace', 'GroupMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
        const uploadResp = await this.bot[ctx].call(
            UploadGroupImageOperation,
            this.groupUin,
            imageMeta,
            subType ?? ImageSubType.Picture,
            summary
        );
        await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.GroupMessage);
        this.segments.push({
            type: 'image',
            msgInfo: uploadResp.upload!.msgInfo!,
            compatFace: uploadResp.upload?.compatQMsg
                ? CustomFaceElement.decode(uploadResp.upload.compatQMsg)
                : undefined,
        });
    }

    override async record(data: Buffer, duration: number): Promise<void> {
        const recordMeta = getGeneralMetadata(data);
        this.bot[log].emit('trace', 'GroupMessageBuilder', `Prepare to upload record ${JSON.stringify(recordMeta)}`);
        const uploadResp = await this.bot[ctx].call(UploadGroupRecordOperation, this.groupUin, recordMeta, duration);
        await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
        this.segments.push({
            type: 'record',
            msgInfo: uploadResp.upload!.msgInfo!,
        });
    }

    override async forward(
        packMsg: (p: ForwardedMessagePacker) => void | Promise<void>
    ): Promise<OutgoingSegmentOf<'forward'>> {
        const packer = new ForwardedMessagePacker(this.bot, this.groupUin);
        await packMsg(packer);
        const pack = await packer.pack();
        this.segments.push(pack);
        return pack;
    }

    override build(clientSequence: number): OutgoingGroupMessage {
        return {
            type: MessageType.GroupMessage,
            groupUin: this.groupUin,
            clientSequence,
            random: randomInt(0, 0xffffffff),
            segments: this.segments,
            reply: this.replyInfo,
        };
    }
}
