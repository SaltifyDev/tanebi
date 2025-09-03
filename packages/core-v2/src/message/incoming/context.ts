import { Bot } from '@/index';
import { BotMessageScene } from '@/common';
import { type BotIncomingForwardedMessage, type BotIncomingMessage, groupMemberDataUpdate, rawMsg } from '.';
import { type CommonMessage } from '@/internal/packet/message/CommonMessage';
import { InferProtoModel } from '@/internal/util/pb';
import { Elem } from '@/internal/packet/message/Elem';
import { Class } from '@/util/types';
import {
    IncomingText,
    IncomingMention,
    IncomingFace,
    IncomingImage,
    IncomingRecord,
    IncomingVideo,
    IncomingForward,
    IncomingLightApp,
} from '@/message/incoming/segment';

type TCommonMessage = InferProtoModel<typeof CommonMessage.fields>;

type IncomingSegmentClass<T> = Class<
    T,
    {
        tryParse(context: MessageParsingContext): T | null;
    }
>;

const SegmentClasses = [
    IncomingText,
    IncomingMention,
    IncomingFace,
    IncomingImage,
    IncomingRecord,
    IncomingVideo,
    IncomingForward,
    IncomingLightApp,
] satisfies readonly IncomingSegmentClass<{ toPreviewString(): string }>[];

/**
 * 接收的消息段，包括：
 * - {@link IncomingText} 文本消息段
 * - {@link IncomingMention} 提及（@）消息段
 * - {@link IncomingFace} 表情消息段
 * - {@link IncomingImage} 图片消息段
 * - {@link IncomingRecord} 语音消息段
 * - {@link IncomingVideo} 视频消息段
 * - {@link IncomingForward} 合并转发消息段
 * - {@link IncomingLightApp} 卡片消息段
 */
export type IncomingSegment = InstanceType<(typeof SegmentClasses)[number]>;

export class MessageParsingContext {
    readonly elems: InferProtoModel<typeof Elem.fields>[];
    private elementPointer: number = 0;

    get currentIndex(): number {
        return this.elementPointer;
    }

    get remaining(): number {
        return this.elems.length - this.elementPointer;
    }

    get total(): number {
        return this.elems.length;
    }

    constructor(readonly bot: Bot, readonly rawMessage: TCommonMessage) {
        this.elems = rawMessage.body!.richText!.elems.map((elem) => Elem.decode(elem));
    }

    hasNext(): boolean {
        return this.elementPointer < this.elems.length;
    }

    next(): InferProtoModel<typeof Elem.fields> {
        if (this.hasNext()) {
            return this.elems[this.elementPointer++];
        }
        throw new Error('访问越界');
    }

    peek(): InferProtoModel<typeof Elem.fields> {
        if (this.hasNext()) {
            return this.elems[this.elementPointer];
        }
        throw new Error('访问越界');
    }

    pushBack(): void {
        if (this.elementPointer > 0) {
            this.elementPointer--;
        }
        throw new Error('访问越界');
    }

    pushBackAndReturn<T>(value: T): T {
        this.pushBack();
        return value;
    }

    skip(count: number = 1): void {
        if (this.elementPointer + count <= this.elems.length) {
            this.elementPointer += count;
        }
        throw new Error('访问越界');
    }

    consume(count: number = 1): void {
        this.skip(count);
    }
}

export function parseMessage(bot: Bot, rawMessage: TCommonMessage): BotIncomingMessage | undefined {
    const context = new MessageParsingContext(bot, rawMessage);
    let message: BotIncomingMessage | undefined;
    const { routingHead, contentHead } = rawMessage;
    if (routingHead.c2cExt) {
        const isSelfSend = routingHead.fromUin === bot.uin;
        message = {
            scene: BotMessageScene.Friend,
            peerUin: isSelfSend ? routingHead.toUin : routingHead.fromUin,
            peerUid: isSelfSend ? routingHead.toUid! : routingHead.fromUid!,
            sequence: contentHead.ntMsgSeq ?? 0,
            time: contentHead.timestamp,
            senderUin: routingHead.fromUin,
            senderUid: routingHead.fromUid!,
            senderName: routingHead.c2cExt.friendName ?? '',
            segments: [],
            [rawMsg]: rawMessage,
        };
    } else if (routingHead.groupExt) {
        message = {
            scene: BotMessageScene.Group,
            peerUin: routingHead.groupExt.groupUin,
            peerUid: String(routingHead.groupExt.groupUin),
            sequence: contentHead.sequence ?? 0,
            time: contentHead.timestamp,
            senderUin: routingHead.fromUin,
            senderUid: routingHead.fromUid!,
            senderName: routingHead.groupExt.memberName,
            segments: [],
            [rawMsg]: rawMessage,
        };
    }
    if (!message) {
        throw new Error('意外的消息类型');
    }

    while (context.hasNext()) {
        const elem = context.peek();

        // Hook for resolving repliedSequence
        if (elem.srcMsg && !message.repliedSequence) {
            message.repliedSequence =
                elem.srcMsg.pbReserve?.friendSequence ?? // for private message
                elem.srcMsg.origSeqs?.[0]; // for group message
        }

        // Hook for group member data update
        if (elem.extraInfo && message.scene === BotMessageScene.Group) {
            message[groupMemberDataUpdate] = {
                nickname: elem.extraInfo.nick,
                card: elem.extraInfo.groupCard,
                specialTitle: elem.extraInfo.senderTitle,
            };
        }

        const indexBefore = context.currentIndex;
        for (const clazz of SegmentClasses) {
            const segment = clazz.tryParse(context);
            if (segment) {
                message.segments.push(segment);
            }
        }
        const indexAfter = context.currentIndex;
        if (indexAfter === indexBefore) {
            context.skip();
        }
    }

    // Filter out redundant leading [Mention,Text] pattern
    if (
        message.repliedSequence &&
        message.scene === BotMessageScene.Group &&
        message.segments.length >= 2 &&
        message.segments[0] instanceof IncomingMention &&
        message.segments[1] instanceof IncomingText &&
        message.segments[1].text.trim() === ''
    ) {
        message.segments.splice(0, 2);
    }

    if (message.segments.length > 0) {
        return message;
    }
}

export function parseForwardedMessage(bot: Bot, rawMessage: TCommonMessage): BotIncomingForwardedMessage | undefined {
    const context = new MessageParsingContext(bot, rawMessage);
    const { routingHead, contentHead } = rawMessage;
    const message: BotIncomingForwardedMessage = {
        sequence: contentHead.sequence ?? 0,
        senderName: routingHead.c2cExt?.friendName ?? routingHead.groupExt?.memberName ?? 'QQ用户',
        senderAvatarUrl:
            contentHead.forward?.avatar ??
            `https://q.qlogo.cn/headimg_dl?dst_uin=${routingHead.fromUin}&spec=640&img_type=jpg`,
        time: contentHead.timestamp,
        segments: [],
    };

    while (context.hasNext()) {
        const elem = context.peek();

        // Hook for resolving repliedSequence
        if (elem.srcMsg && !message.repliedSequence) {
            message.repliedSequence = elem.srcMsg.origSeqs?.[0];
        }

        const indexBefore = context.currentIndex;
        for (const clazz of SegmentClasses) {
            const segment = clazz.tryParse(context);
            if (segment) {
                message.segments.push(segment);
            }
        }
        const indexAfter = context.currentIndex;
        if (indexAfter === indexBefore) {
            context.skip();
        }
    }

    if (message.segments.length > 0) {
        return message;
    }
}
