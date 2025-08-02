import { BotGroup, BotGroupMember, BotGroupMessage } from '@/entity';
import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageType } from '@/internal/message';
import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { OutgoingGroupMessage, ReplyInfo } from '@/internal/message/outgoing';
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
    private readonly groupUin;
    replyInfo?: ReplyInfo;

    constructor(private readonly group: BotGroup, bot: Bot) {
        super(bot);
        this.groupUin = group.uin;
    }

    /**
     * Mention a member in the group
     * @param member The member (or its uin) to mention
     */
    mention(member: number): void;
    /**
     * Mention a member in the group
     * @param member The member (or its uin) to mention
     */
    mention(member: BotGroupMember): void;
    mention(member: number | BotGroupMember) {
        if (typeof member === 'number') {
            this.segments.push((async () => {
                const actualMember = await this.group.getMember(member);
                if (!actualMember) {
                    throw new Error(`Member with ID ${member} not found in group ${this.groupUin}`);
                }
                return {
                    type: 'mention',
                    uin: actualMember.uin,
                    uid: actualMember.uid,
                    name: '@' + (actualMember.card || actualMember.nickname),
                };
            })());
        } else {
            this.segments.push(Promise.resolve({
                type: 'mention',
                uin: member.uin,
                uid: member.uid,
                name: '@' + (member.card || member.nickname),
            }));
        }
    }

    /**
     * Mention all members in the group
     */
    mentionAll() {
        this.segments.push(Promise.resolve({
            type: 'mention',
            uin: 0,
            uid: '',
            name: '@全体成员',
        }));
    }

    /**
     * Reply to a group message
     */
    reply(message: BotGroupMessage) {
        if (message[rawMessage].groupUin !== this.groupUin) {
            throw new Error('Cannot reply to a message from another group');
        }
        this.replyInfo = {
            sequence: message.sequence,
            senderUin: message[rawMessage].senderUin,
            senderUid: message[rawMessage].senderUid!,
            messageUid: message.messageUid,
            elements: message[rawMessage][rawElems],
        };
    }

    override image(data: Buffer, subType?: ImageSubType, summary?: string) {
        this.segments.push((async () => {
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
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatFace: uploadResp.upload?.compatQMsg
                    ? CustomFaceElement.decode(uploadResp.upload.compatQMsg)
                    : undefined,
            };
        })());
    }

    override async record(data: Buffer, duration: number): Promise<void> {
        this.segments.push((async () => {
            const recordMeta = getGeneralMetadata(data);
            this.bot[log].emit('trace', 'GroupMessageBuilder', `Prepare to upload record ${JSON.stringify(recordMeta)}`);
            const uploadResp = await this.bot[ctx].call(UploadGroupRecordOperation, this.groupUin, recordMeta, duration);
            await this.bot[ctx].highwayLogic.uploadRecord(data, recordMeta, uploadResp);
            return {
                type: 'record',
                msgInfo: uploadResp.upload!.msgInfo!,
            };
        })());
    }

    override forward(packMsg: (p: ForwardedMessagePacker) => void | Promise<void>) {
        this.segments.push((async () => {
            const packer = new ForwardedMessagePacker(this.bot, this.groupUin);
            await packMsg(packer);
            return await packer.pack();
        })());
    }

    override async build(clientSequence: number): Promise<OutgoingGroupMessage> {
        return {
            type: MessageType.GroupMessage,
            groupUin: this.groupUin,
            clientSequence,
            random: randomInt(0, 0xffffffff),
            segments: await Promise.all(this.segments),
            reply: this.replyInfo,
        };
    }
}
